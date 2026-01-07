import { expect } from "chai";
import { User } from "../../src/user";

describe(`[Class] User`, () => {

    describe(`[Method] authFlowState`, () => {
        it(`should update authentication state and authenticated flag`, () => {
            const user = new User();

            expect(user.authFlowState).to.equal("AwaitingChoice");
            expect(user.authenticated).to.equal(false);

            user.authFlowState = "Authenticated";

            expect(user.authFlowState).to.equal("Authenticated");
            expect(user.authenticated).to.equal(true);
        });
    });

    describe(`[Method] clearPendingCredentials`, () => {
        it(`should clear pending username and password`, () => {
            const user = new User();
            user.pendingUsername = "player";
            user.pendingPassword = "secret";

            user.clearPendingCredentials();

            expect(user.pendingUsername).to.equal(undefined);
            expect(user.pendingPassword).to.equal(undefined);
        });
    });

    describe(`[Method] pendingPassword`, () => {
        it(`should set and get the pending password`, () => {
            const user = new User();

            user.pendingPassword = "secret";

            expect(user.pendingPassword).to.equal("secret");
        });
    });

    describe(`[Method] pendingUsername`, () => {
        it(`should set and get the pending username`, () => {
            const user = new User();

            user.pendingUsername = "player";

            expect(user.pendingUsername).to.equal("player");
        });
    });

    describe(`[Method] playerCharacterNames`, () => {
        it(`should set and get the player character names`, () => {
            const user = new User();

            user.playerCharacterNames = ["Hero", "Mage"];

            expect(user.playerCharacterNames).to.deep.equal(["Hero", "Mage"]);
        });
    });

    describe(`[Method] username`, () => {
        it(`should set and get the username`, () => {
            const user = new User();

            user.username = "player";

            expect(user.username).to.equal("player");
        });
    });

});

