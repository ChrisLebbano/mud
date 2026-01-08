import { NodeHttpServerFactory } from "../../../../src/application/server/node-http-server-factory";
import { expect } from "chai";

describe(`[Class] NodeHttpServerFactory`, () => {

    describe(`[Method] createServer`, () => {

        it(`should create a server instance`, (done) => {
            const server = NodeHttpServerFactory.createServer((request, response) => {
                response.statusCode = 200;
                response.end("OK");
            });

            expect(server.listen).to.be.a("function");

            server.listen(0, () => {
                server.close(() => {
                    done();
                });
            });
        });

    });

});
