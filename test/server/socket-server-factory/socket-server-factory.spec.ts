import { SocketServerFactory } from "../../../src/server/socket-server-factory";
import { expect } from "chai";
import { createServer } from "node:http";

describe(`[Class] SocketServerFactory`, () => {

    describe(`[Method] createSocketIOServer`, () => {

        it(`should create a socket server instance`, () => {
            const httpServer = createServer();

            const socketServer = SocketServerFactory.createSocketIOServer(httpServer);

            expect(socketServer.close).to.be.a("function");
            socketServer.close();
            httpServer.close();
        });

    });

});
