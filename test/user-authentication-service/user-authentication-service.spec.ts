import { expect } from "chai";
import { type UserRecord } from "../../src/types";
import { UserAuthenticationService } from "../../src/user-authentication-service";

class FakePasswordService {

    private _hashResult: string;
    private _verifyResult: boolean;

    constructor(hashResult: string, verifyResult: boolean) {
        this._hashResult = hashResult;
        this._verifyResult = verifyResult;
    }

    public async hashPassword(): Promise<string> {
        return this._hashResult;
    }

    public async verifyPassword(): Promise<boolean> {
        return this._verifyResult;
    }

}

class FakeTokenService {

    private _token: string;

    constructor(token: string) {
        this._token = token;
    }

    public createToken(): string {
        return this._token;
    }

}

class FakeUserRepository {

    private _characterNames: string[];
    private _existingUser: UserRecord | null;
    private _nextId: number;

    constructor(characterNames: string[], existingUser: UserRecord | null, nextId: number) {
        this._characterNames = characterNames;
        this._existingUser = existingUser;
        this._nextId = nextId;
    }

    public async createUser(username: string, passwordHash: string): Promise<UserRecord> {
        return {
            id: this._nextId,
            passwordHash,
            username
        };
    }

    public async findUserByUsername(): Promise<UserRecord | null> {
        return this._existingUser;
    }

    public async listCharacterNamesByUserId(): Promise<string[]> {
        return this._characterNames;
    }

}

describe(`[Class] UserAuthenticationService`, () => {

    describe(`[Method] loginUser`, () => {
        it(`should return null if the user does not exist`, async () => {
            const passwordService = new FakePasswordService("hashed", true);
            const tokenService = new FakeTokenService("token");
            const userRepository = new FakeUserRepository([], null, 1);
            const userAuthenticationService = new UserAuthenticationService(
                passwordService as never,
                tokenService as never,
                userRepository as never
            );

            const result = await userAuthenticationService.loginUser("player", "password");

            expect(result).to.equal(null);
        });

        it(`should return null if the password is invalid`, async () => {
            const passwordService = new FakePasswordService("hashed", false);
            const tokenService = new FakeTokenService("token");
            const userRepository = new FakeUserRepository([], {
                id: 2,
                passwordHash: "hashed",
                username: "player"
            }, 1);
            const userAuthenticationService = new UserAuthenticationService(
                passwordService as never,
                tokenService as never,
                userRepository as never
            );

            const result = await userAuthenticationService.loginUser("player", "password");

            expect(result).to.equal(null);
        });

        it(`should return a token and character names for valid credentials`, async () => {
            const passwordService = new FakePasswordService("hashed", true);
            const tokenService = new FakeTokenService("token");
            const userRepository = new FakeUserRepository(["Hero"], {
                id: 3,
                passwordHash: "hashed",
                username: "player"
            }, 1);
            const userAuthenticationService = new UserAuthenticationService(
                passwordService as never,
                tokenService as never,
                userRepository as never
            );

            const result = await userAuthenticationService.loginUser("player", "password");

            expect(result).to.deep.equal({
                authToken: "token",
                playerCharacterNames: ["Hero"],
                username: "player"
            });
        });
    });

    describe(`[Method] signupUser`, () => {
        it(`should return null if the username already exists`, async () => {
            const passwordService = new FakePasswordService("hashed", true);
            const tokenService = new FakeTokenService("token");
            const userRepository = new FakeUserRepository([], {
                id: 4,
                passwordHash: "hashed",
                username: "player"
            }, 5);
            const userAuthenticationService = new UserAuthenticationService(
                passwordService as never,
                tokenService as never,
                userRepository as never
            );

            const result = await userAuthenticationService.signupUser("player", "password");

            expect(result).to.equal(null);
        });

        it(`should create a user and return a token`, async () => {
            const passwordService = new FakePasswordService("hashed", true);
            const tokenService = new FakeTokenService("token");
            const userRepository = new FakeUserRepository([], null, 5);
            const userAuthenticationService = new UserAuthenticationService(
                passwordService as never,
                tokenService as never,
                userRepository as never
            );

            const result = await userAuthenticationService.signupUser("player", "password");

            expect(result).to.deep.equal({
                authToken: "token",
                playerCharacterNames: [],
                username: "player"
            });
        });
    });

});
