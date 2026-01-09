import { PasswordHasher } from "../../../../src/application/server/password-hasher";
import { SignupRequestHandler } from "../../../../src/application/server/signup-request-handler";
import { type UserCreateData, type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

class FakeUserRepository {

    private _createdUsers: UserCreateData[] = [];
    private _emailUser: UserRecord | null;
    private _usernameUser: UserRecord | null;

    constructor(usernameUser: UserRecord | null, emailUser: UserRecord | null) {
        this._emailUser = emailUser;
        this._usernameUser = usernameUser;
    }

    public get createdUsers(): UserCreateData[] {
        return this._createdUsers;
    }

    public createUser(userData: UserCreateData): Promise<UserRecord> {
        this._createdUsers.push(userData);
        return Promise.resolve({
            email: userData.email,
            id: 1,
            lastLoginOn: null,
            loginToken: null,
            passwordHash: userData.passwordHash,
            username: userData.username
        });
    }

    public findByEmail(): Promise<UserRecord | null> {
        return Promise.resolve(this._emailUser);
    }

    public findByUsername(): Promise<UserRecord | null> {
        return Promise.resolve(this._usernameUser);
    }

}

class FakeResponse {

    private _body = "";
    private _headers: Record<string, string> = {};
    private _statusCode = 0;

    public get body(): string {
        return this._body;
    }

    public end(body?: string): void {
        this._body = body ?? "";
    }

    public get headers(): Record<string, string> {
        return this._headers;
    }

    public setHeader(key: string, value: string): void {
        this._headers[key] = value;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

}

const createJsonRequest = (payload: unknown): IncomingMessage => {
    const request = Readable.from([JSON.stringify(payload)]) as IncomingMessage;
    request.method = "POST";
    return request;
};

describe(`[Class] SignupRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should warn when the username already exists`, async () => {
            const repository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                lastLoginOn: null,
                loginToken: null,
                passwordHash: "hash",
                username: "hero"
            }, null);
            const handler = new SignupRequestHandler(repository);
            const request = createJsonRequest({ email: "hero@example.com", password: "pass", username: "hero" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(409);
            expect(body).to.deep.equal({ warning: "Username already exists. Please select a new username." });
        });

        it(`should create a user when the username and email are available`, async () => {
            const passwordHasher = new PasswordHasher();
            const repository = new FakeUserRepository(null, null);
            const handler = new SignupRequestHandler(repository);
            const request = createJsonRequest({ email: "hero@example.com", password: "pass", username: "hero" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);
            const createdUser = repository.createdUsers[0];

            expect((response as unknown as FakeResponse).statusCode).to.equal(201);
            expect(body).to.deep.equal({ message: "Signup successful." });
            expect(repository.createdUsers).to.have.lengthOf(1);
            expect(createdUser.email).to.equal("hero@example.com");
            expect(createdUser.username).to.equal("hero");
            expect(await passwordHasher.verifyPassword("pass", createdUser.passwordHash)).to.equal(true);
        });

    });

});
