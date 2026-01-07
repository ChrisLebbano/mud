import { expect } from "chai";
import { PasswordService } from "../../src/password-service";

describe(`[Class] PasswordService`, () => {

    describe(`[Method] hashPassword`, () => {
        it(`should hash the password with the secret`, async () => {
            const passwordService = new PasswordService("secret-key", 4);

            const hashedPassword = await passwordService.hashPassword("hunter2");

            expect(hashedPassword).to.be.a("string");
            expect(hashedPassword).to.not.equal("hunter2");
        });
    });

    describe(`[Method] verifyPassword`, () => {
        it(`should validate the password against the hash`, async () => {
            const passwordService = new PasswordService("secret-key", 4);

            const hashedPassword = await passwordService.hashPassword("hunter2");
            const isValid = await passwordService.verifyPassword("hunter2", hashedPassword);
            const isInvalid = await passwordService.verifyPassword("wrong", hashedPassword);

            expect(isValid).to.equal(true);
            expect(isInvalid).to.equal(false);
        });
    });

});

