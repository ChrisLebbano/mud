import { LoginTokenGenerator } from "../../../src/server/login-token-generator";
import { expect } from "chai";

describe(`[Class] LoginTokenGenerator`, () => {

    describe(`[Method] generate`, () => {

        it(`should return a non-empty token string`, () => {
            const generator = new LoginTokenGenerator();

            const token = generator.generate();

            expect(token).to.be.a("string");
            expect(token).to.not.equal("");
        });

        it(`should generate unique tokens`, () => {
            const generator = new LoginTokenGenerator();

            const tokenA = generator.generate();
            const tokenB = generator.generate();

            expect(tokenA).to.not.equal(tokenB);
        });

    });

});

