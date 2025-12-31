import { Application } from "../../src/application";
import { Server } from "../../src/server";
import { type NodeHttpServer } from "../../src/types";
import { expect } from "chai";

describe(`[Class] Application`, () => {

    describe(`[Method] init`, () => {

        it(`should create an instance of a server`, () => {
            const originalStart = Server.prototype.start;
            let startCalled = false;

            Server.prototype.start = function (): NodeHttpServer {
                startCalled = true;
                return {} as NodeHttpServer;
            };

            const app = new Application({ port: 8000 });

            expect(app.server).to.be.undefined;

            app.init();

            expect(app.server).to.be.ok;
            expect(startCalled).to.equal(true);

            Server.prototype.start = originalStart;
        });

    });

});
