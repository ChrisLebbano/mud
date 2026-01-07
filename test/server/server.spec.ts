import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { CharacterClass } from "../../src/character-class";
import { GameClientRoute } from "../../src/game-client-route";
import { NodeHttpServerFactory } from "../../src/node-http-server-factory";
import { Race } from "../../src/race";
import { Room } from "../../src/room";
import { Server } from "../../src/server";
import { ServerRouter } from "../../src/server-router";
import { SocketServerFactory } from "../../src/socket-server-factory";
import { type HttpRequestHandler, type NodeHttpServer, type SocketServer, type UserAuthenticationResult } from "../../src/types";
import { World } from "../../src/world";
import { Zone } from "../../src/zone";

class FakeHttpServer {

    private _handler?: HttpRequestHandler;
    private _listenPort?: number;
    private _listeningListeners: Array<() => void> = [];

    public close(callback?: (error?: Error) => void): void {
        if (callback) {
            callback();
        }
    }

    public get handler(): HttpRequestHandler | undefined {
        return this._handler;
    }

    public get listenPort(): number | undefined {
        return this._listenPort;
    }

    public listen(port: number, callback?: () => void): void {
        this._listenPort = port;
        this._listeningListeners.forEach((listener) => listener());
        if (callback) {
            callback();
        }
    }

    public on(event: "listening", listener: () => void): void {
        if (event === "listening") {
            this._listeningListeners.push(listener);
        }
    }

    public set handler(handler: HttpRequestHandler | undefined) {
        this._handler = handler;
    }

}

class FakeResponse {

    private _body = "";
    private _headers: Record<string, string> = {};
    private _statusCode = 0;

    public end(body?: string): void {
        if (body) {
            this._body = body;
        }
    }

    public get body(): string {
        return this._body;
    }

    public get headers(): Record<string, string> {
        return this._headers;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public setHeader(name: string, value: string): void {
        this._headers[name] = value;
    }

    public set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

}

class FakeSocketServer {

    private _connectionListeners: Array<(socket: FakeSocket) => void> = [];
    private _roomEmits: Array<Record<string, unknown>> = [];

    public close(callback?: (error?: Error) => void): void {
        if (callback) {
            callback();
        }
    }

    public get connectionListeners(): Array<(socket: FakeSocket) => void> {
        return this._connectionListeners;
    }

    public get roomEmits(): Array<Record<string, unknown>> {
        return this._roomEmits;
    }

    public on(event: "connection", listener: (socket: FakeSocket) => void): void {
        if (event === "connection") {
            this._connectionListeners.push(listener);
        }
    }

    public to(roomId: string): { emit: (event: string, payload: unknown) => void } {
        return {
            emit: (event: string, payload: unknown) => {
                this._roomEmits.push({ event, payload, roomId });
            }
        };
    }

}

class FakeSocket {

    private _id: string;
    private _disconnectListeners: Array<() => void> = [];
    private _emits: Array<Record<string, unknown>> = [];
    private _joinedRooms: Set<string> = new Set();
    private _submitListeners: Array<(command: string) => void> = [];

    constructor(id?: string) {
        this._id = id ? id : "fake-socket";
    }

    public emit(event: string, payload: unknown): void {
        this._emits.push({ event, payload });
    }

    public get disconnectListeners(): Array<() => void> {
        return this._disconnectListeners;
    }

    public get emits(): Array<Record<string, unknown>> {
        return this._emits;
    }

    public get id(): string {
        return this._id;
    }

    public get joinedRooms(): string[] {
        return Array.from(this._joinedRooms.values());
    }

    public get submitListeners(): Array<(command: string) => void> {
        return this._submitListeners;
    }

    public join(roomId: string): void {
        this._joinedRooms.add(roomId);
    }

    public leave(roomId: string): void {
        this._joinedRooms.delete(roomId);
    }

    public on(event: "disconnect" | "submit", listener: ((command: string) => void) | (() => void)): void {
        if (event === "submit") {
            this._submitListeners.push(listener as (command: string) => void);
            return;
        }

        if (event === "disconnect") {
            this._disconnectListeners.push(listener);
        }
    }

    public to(roomId: string): { emit: (event: string, payload: unknown) => void } {
        return {
            emit: (event: string, payload: unknown) => {
                this._emits.push({ event: `room:${roomId}:${event}`, payload });
            }
        };
    }

}

class FakeUserAuthenticationService {

    private _loginResult: UserAuthenticationResult | null;
    private _signupResult: UserAuthenticationResult | null;

    constructor(loginResult: UserAuthenticationResult | null, signupResult: UserAuthenticationResult | null) {
        this._loginResult = loginResult;
        this._signupResult = signupResult;
    }

    public async loginUser(): Promise<UserAuthenticationResult | null> {
        return this._loginResult;
    }

    public async signupUser(): Promise<UserAuthenticationResult | null> {
        return this._signupResult;
    }

}

const humanBaseAttributes = {
    agility: 10,
    charisma: 12,
    constitution: 10,
    dexterity: 10,
    health: 42,
    intelligence: 10,
    mana: 22,
    perception: 10,
    resolve: 10,
    strength: 10,
    wisdom: 10
};

const warriorModifiers = {
    agility: 1,
    charisma: -1,
    constitution: 2,
    dexterity: 1,
    health: 6,
    intelligence: -1,
    mana: -2,
    perception: 0,
    resolve: 1,
    strength: 2,
    wisdom: -1
};

const createServerConfig = () => ({
    authSecret: "test-auth-secret",
    databaseConfig: {
        database: "mud",
        host: "127.0.0.1",
        password: "mud_password",
        port: 3306,
        user: "mud_user"
    },
    port: 4321,
    tokenSecret: "test-token-secret"
});

const createWorld = (): World => {
    const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
    const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
    return new World([new Zone("test-zone", "Test Zone", [
        new Room("test-room", "Test Room", "A test room.", {})
    ], "test-room")], [race], [characterClass], "test-zone", "test-room", "human", "warrior");
};

describe(`[Class] Server`, () => {

    describe(`[Method] start`, () => {

        it(`should start the server on the configured port`, () => {
            const originalHttpServerFactory = NodeHttpServerFactory.createServer;
            const originalSocketServerFactory = SocketServerFactory.createSocketIOServer;
            const fakeServer = new FakeHttpServer();
            let createdSocketServer: FakeSocketServer | undefined;

            NodeHttpServerFactory.createServer = (handler: HttpRequestHandler): NodeHttpServer => {
                fakeServer.handler = handler;
                return fakeServer as unknown as NodeHttpServer;
            };

            SocketServerFactory.createSocketIOServer = (): SocketServer => {
                createdSocketServer = new FakeSocketServer();
                return createdSocketServer as unknown as SocketServer;
            };

            const serverRouter = new ServerRouter([]);
            const userAuthenticationService = new FakeUserAuthenticationService(null, null);
            const server = new Server(createServerConfig(), serverRouter, createWorld(), userAuthenticationService);

            const startedServer = server.start();

            expect(startedServer).to.equal(fakeServer as unknown as NodeHttpServer);
            expect(createdSocketServer).to.be.ok;
            expect(fakeServer.listenPort).to.equal(4321);
            expect(fakeServer.handler).to.be.a("function");

            NodeHttpServerFactory.createServer = originalHttpServerFactory;
            SocketServerFactory.createSocketIOServer = originalSocketServerFactory;
        });

        it(`should serve the game client html`, () => {
            const originalHttpServerFactory = NodeHttpServerFactory.createServer;
            const originalSocketServerFactory = SocketServerFactory.createSocketIOServer;
            const fakeServer = new FakeHttpServer();

            NodeHttpServerFactory.createServer = (handler: HttpRequestHandler): NodeHttpServer => {
                fakeServer.handler = handler;
                return fakeServer as unknown as NodeHttpServer;
            };

            SocketServerFactory.createSocketIOServer = (): SocketServer => {
                return new FakeSocketServer() as unknown as SocketServer;
            };

            const serverRouter = new ServerRouter([new GameClientRoute()]);
            const userAuthenticationService = new FakeUserAuthenticationService(null, null);
            const server = new Server(createServerConfig(), serverRouter, createWorld(), userAuthenticationService);

            server.start();

            const request = { url: "/game-client" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            fakeServer.handler?.(request, response);

            expect(response.statusCode).to.equal(200);
            expect(response.headers["Content-Type"]).to.equal("text/html");
            expect(response.body).to.include("Game Client");

            NodeHttpServerFactory.createServer = originalHttpServerFactory;
            SocketServerFactory.createSocketIOServer = originalSocketServerFactory;
        });

        it(`should log submitted commands from socket connections`, () => {
            const originalHttpServerFactory = NodeHttpServerFactory.createServer;
            const originalSocketServerFactory = SocketServerFactory.createSocketIOServer;
            const originalConsoleLog = console.log;
            const fakeServer = new FakeHttpServer();
            const logMessages: string[] = [];
            let createdSocketServer: FakeSocketServer | undefined;

            console.log = (message?: unknown) => {
                if (message) {
                    logMessages.push(String(message));
                }
            };

            NodeHttpServerFactory.createServer = (handler: HttpRequestHandler): NodeHttpServer => {
                fakeServer.handler = handler;
                return fakeServer as unknown as NodeHttpServer;
            };

            SocketServerFactory.createSocketIOServer = (): SocketServer => {
                createdSocketServer = new FakeSocketServer();
                return createdSocketServer as unknown as SocketServer;
            };

            const serverRouter = new ServerRouter([]);
            const userAuthenticationService = new FakeUserAuthenticationService(null, null);
            const server = new Server(createServerConfig(), serverRouter, createWorld(), userAuthenticationService);

            server.start();

            const fakeSocket = new FakeSocket();

            expect(createdSocketServer).to.be.ok;
            createdSocketServer?.connectionListeners.forEach((listener) => listener(fakeSocket));
            fakeSocket.submitListeners.forEach((listener) => listener("look"));

            expect(logMessages).to.deep.equal([
                "[INFO] Socket Server started",
                "[INFO] Server started on port 4321",
                "[INFO] Received command: look"
            ]);

            console.log = originalConsoleLog;
            NodeHttpServerFactory.createServer = originalHttpServerFactory;
            SocketServerFactory.createSocketIOServer = originalSocketServerFactory;
        });

        it(`should require authentication before entering the world`, () => {
            const originalHttpServerFactory = NodeHttpServerFactory.createServer;
            const originalSocketServerFactory = SocketServerFactory.createSocketIOServer;
            const fakeServer = new FakeHttpServer();
            let createdSocketServer: FakeSocketServer | undefined;

            NodeHttpServerFactory.createServer = (handler: HttpRequestHandler): NodeHttpServer => {
                fakeServer.handler = handler;
                return fakeServer as unknown as NodeHttpServer;
            };

            SocketServerFactory.createSocketIOServer = (): SocketServer => {
                createdSocketServer = new FakeSocketServer();
                return createdSocketServer as unknown as SocketServer;
            };

            const serverRouter = new ServerRouter([]);
            const authResult: UserAuthenticationResult = {
                authToken: "token",
                playerCharacterNames: ["Hero"],
                username: "player"
            };
            const userAuthenticationService = new FakeUserAuthenticationService(authResult, null);
            const server = new Server(createServerConfig(), serverRouter, createWorld(), userAuthenticationService);

            server.start();

            const fakeSocket = new FakeSocket();
            createdSocketServer?.connectionListeners.forEach((listener) => listener(fakeSocket));

            expect(fakeSocket.joinedRooms).to.deep.equal([]);
            expect(fakeSocket.emits[0]).to.deep.equal({
                event: "world:system",
                payload: { category: "System", message: "Welcome! Please type 'login' or 'signup' to continue." }
            });

            fakeSocket.submitListeners.forEach((listener) => listener("login"));
            fakeSocket.submitListeners.forEach((listener) => listener("player"));
            fakeSocket.submitListeners.forEach((listener) => listener("password"));

            expect(fakeSocket.joinedRooms.length).to.equal(1);
            const authTokenEmit = fakeSocket.emits.find((emit) => emit.event === "auth:token");
            expect(authTokenEmit).to.be.ok;
            const roomEmit = fakeSocket.emits.find((emit) => emit.event === "world:room");
            expect(roomEmit).to.be.ok;

            NodeHttpServerFactory.createServer = originalHttpServerFactory;
            SocketServerFactory.createSocketIOServer = originalSocketServerFactory;
        });

    });

});
