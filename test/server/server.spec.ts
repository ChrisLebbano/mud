import { expect } from "chai";
import { Server } from "../../src/server";
import { type ServerFactory, type ServerInstance } from "../../src/types";

class FakeServer implements ServerInstance {

    private _listenPort?: number;

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

describe(`[Class] Server`, () => {

    describe(`[Method] start`, () => {

        it(`should start the server on the configured port`, () => {
            const fakeServer = new FakeServer();
            const serverFactory = new FakeServerFactory(fakeServer);
            const server = new Server({ port: 4321 }, serverFactory);

            const startedServer = server.start();

            expect(startedServer).to.equal(fakeServer);
            expect(fakeServer.listenPort).to.equal(4321);
        });

    });

});
