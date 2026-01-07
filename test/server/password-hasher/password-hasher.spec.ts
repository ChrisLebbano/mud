import { PasswordHasher } from "../../../src/server/password-hasher";
import { expect } from "chai";

describe(`[Class] PasswordHasher`, () => {

    describe(`[Method] hashPassword`, () => {

        it(`should return a scrypt hash with a salt`, async () => {
            const hasher = new PasswordHasher();

            const hash = await hasher.hashPassword("super-secret");

            expect(hash.startsWith("scrypt$")).to.equal(true);
            expect(hash).to.match(/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
        });

    });

});

