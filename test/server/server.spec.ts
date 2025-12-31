import { NodeHttpServerFactory } from "../../src/node-http-server-factory";
import { Server } from "../../src/server";
import { ServerRouter } from "../../src/server-router";
import { SocketServerFactory } from "../../src/socket-server-factory";
import { type HttpRequestHandler, type NodeHttpServer, type SocketServer } from "../../src/types";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

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

    public get body(): string {
        return this._body;
    }

    public end(body?: string): void {
        if (body) {
            this._body = body;
        }
    }

    public get headers(): Record<string, string> {
        return this._headers;
    }

    public setHeader(name: string, value: string): void {
        this._headers[name] = value;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

}

class FakeSocketServer {

    public close(callback?: (error?: Error) => void): void {
        if (callback) {
            callback();
        }
    }

}

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
            const server = new Server({ port: 4321 }, serverRouter);

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

            const serverRouter = new ServerRouter([]);
            const server = new Server({ port: 4321 }, serverRouter);

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

    });

});

