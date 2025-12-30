import { expect } from "chai";
import { createServer } from "node:http";
import { SocketServerFactory } from "../../src/socket-server-factory";

describe(`[Class] SocketServerFactory`, () => {

    describe(`[Method] createServer`, () => {

        it(`should create a socket server instance`, () => {
            const httpServer = createServer();
            const socketServerFactory = new SocketServerFactory();

            const socketServer = socketServerFactory.createServer(httpServer);

            expect(socketServer.close).to.be.a("function");
            socketServer.close();
            httpServer.close();
        });

    });

});

