import { expect } from "chai";
import { HttpServerFactory } from "../../src/http-server-factory";

describe(`[Class] HttpServerFactory`, () => {

    describe(`[Method] createServer`, () => {

        it(`should create a server instance`, () => {
            const serverFactory = new HttpServerFactory();

            const server = serverFactory.createServer();

            expect(server.listen).to.be.a("function");
        });

    });

});

