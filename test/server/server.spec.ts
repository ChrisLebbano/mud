import { expect } from "chai";
import { Server } from "../../src/server";
import { type ServerFactory, type ServerInstance, type SocketServerFactory, type SocketServerInstance } from "../../src/types";

class FakeServer implements ServerInstance {

    private _listenPort?: number;
    private _listeningListeners: Array<() => void> = [];

    public close(callback?: (error?: Error) => void): void {
        if (callback) {
            callback();
        }
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

}

class FakeSocketServer implements SocketServerInstance {

    public close(callback?: (error?: Error) => void): void {
        if (callback) {
            callback();
        }
    }

}

class FakeServerFactory implements ServerFactory {

    private _server: FakeServer;

    constructor(server: FakeServer) {
        this._server = server;
    }

    public createServer(): ServerInstance {
        return this._server;
    }

}

class FakeSocketServerFactory implements SocketServerFactory {

    private _server?: ServerInstance;
    private _socketServer: FakeSocketServer;

    constructor(socketServer: FakeSocketServer) {
        this._socketServer = socketServer;
    }

    public createServer(server: ServerInstance): SocketServerInstance {
        this._server = server;
        return this._socketServer;
    }

    public get server(): ServerInstance | undefined {
        return this._server;
    }

}

describe(`[Class] Server`, () => {

    describe(`[Method] start`, () => {

        it(`should start the server on the configured port`, () => {
            const fakeServer = new FakeServer();
            const serverFactory = new FakeServerFactory(fakeServer);
            const fakeSocketServer = new FakeSocketServer();
            const socketServerFactory = new FakeSocketServerFactory(fakeSocketServer);
            const server = new Server({ port: 4321 }, serverFactory, socketServerFactory);

            const startedServer = server.start();

            expect(startedServer).to.equal(fakeServer);
            expect(socketServerFactory.server).to.equal(fakeServer);
            expect(fakeServer.listenPort).to.equal(4321);
        });

    });

});
