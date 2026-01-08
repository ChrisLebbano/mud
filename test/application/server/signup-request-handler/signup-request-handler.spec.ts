import { SignupRequestHandler } from "../../../../src/application/server/signup-request-handler";
import { type UserCreateData, type UserRecord, type UserSignupPayload } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeJsonBodyParser {

    private _payload: UserSignupPayload | null;
    private _shouldReject: boolean;

    constructor(payload: UserSignupPayload | null, shouldReject: boolean) {
        this._payload = payload;
        this._shouldReject = shouldReject;
    }

    public parse<T>(_request: IncomingMessage): Promise<T> {
        if (this._shouldReject) {
            return Promise.reject(new Error("invalid json"));
        }

        return Promise.resolve(this._payload as T);
    }

}

class FakePasswordHasher {

    private _hash: string;
    private _hashCalls: string[] = [];

    constructor(hash: string) {
        this._hash = hash;
    }

    public get hashCalls(): string[] {
        return this._hashCalls;
    }

    public async hashPassword(password: string): Promise<string> {
        this._hashCalls.push(password);
        return Promise.resolve(this._hash);
    }

}

class FakeUserRepository {

    private _createdUsers: UserCreateData[] = [];
    private _emailUser: UserRecord | null;
    private _usernameUser: UserRecord | null;

    constructor(usernameUser: UserRecord | null, emailUser: UserRecord | null) {
        this._emailUser = emailUser;
        this._usernameUser = usernameUser;
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

    public get createdUsers(): UserCreateData[] {
        return this._createdUsers;
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

describe(`[Class] SignupRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should warn when the username already exists`, async () => {
            const parser = new FakeJsonBodyParser({ email: "hero@example.com", password: "pass", username: "hero" }, false);
            const hasher = new FakePasswordHasher("hash");
            const repository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                lastLoginOn: null,
                loginToken: null,
                passwordHash: "hash",
                username: "hero"
            }, null);
            const handler = new SignupRequestHandler(parser, hasher, repository);
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(409);
            expect(body).to.deep.equal({ warning: "Username already exists. Please select a new username." });
            expect(hasher.hashCalls).to.deep.equal([]);
        });

        it(`should create a user when the username and email are available`, async () => {
            const parser = new FakeJsonBodyParser({ email: "hero@example.com", password: "pass", username: "hero" }, false);
            const hasher = new FakePasswordHasher("hash");
            const repository = new FakeUserRepository(null, null);
            const handler = new SignupRequestHandler(parser, hasher, repository);
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(201);
            expect(body).to.deep.equal({ message: "Signup successful." });
            expect(repository.createdUsers).to.deep.equal([
                {
                    email: "hero@example.com",
                    passwordHash: "hash",
                    username: "hero"
                }
            ]);
            expect(hasher.hashCalls).to.deep.equal(["pass"]);
        });

    });

});
