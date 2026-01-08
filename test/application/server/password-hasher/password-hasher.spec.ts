import { PasswordHasher } from "../../../../src/application/server/password-hasher";
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

    describe(`[Method] verifyPassword`, () => {

        it(`should return true for matching passwords`, async () => {
            const hasher = new PasswordHasher();
            const hash = await hasher.hashPassword("super-secret");

            const matches = await hasher.verifyPassword("super-secret", hash);

            expect(matches).to.equal(true);
        });

        it(`should return false for invalid passwords`, async () => {
            const hasher = new PasswordHasher();
            const hash = await hasher.hashPassword("super-secret");

            const matches = await hasher.verifyPassword("incorrect", hash);

            expect(matches).to.equal(false);
        });

    });

});
