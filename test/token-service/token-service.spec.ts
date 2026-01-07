import { expect } from "chai";
import { verify } from "jsonwebtoken";
import { TokenService } from "../../src/token-service";

describe(`[Class] TokenService`, () => {

    describe(`[Method] createToken`, () => {
        it(`should create a signed token with user data`, () => {
            const tokenService = new TokenService("token-secret");
            const token = tokenService.createToken("player", ["Hero", "Mage"]);

            const payload = verify(token, "token-secret") as { playerCharacterNames: string[]; username: string };

            expect(payload.username).to.equal("player");
            expect(payload.playerCharacterNames).to.deep.equal(["Hero", "Mage"]);
        });
    });

});

