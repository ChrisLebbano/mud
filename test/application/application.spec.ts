import { expect } from "chai";
import { Application } from "../../src/application";

describe(`[Class] Application`, () => {

    describe(`[Method] init`, () => {

        it(`should create an instance of a server`, () => {

            const app = new Application({ port: 8000 });

            expect(app.server).to.be.undefined;

            app.init();

            expect(app.server).to.be.ok;

        });

    });

});