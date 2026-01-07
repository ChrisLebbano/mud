import { LoginRequestHandler } from "../../../src/server/login-request-handler";
import { type UserLoginPayload, type UserRecord } from "../../../src/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeJsonBodyParser {

    private _payload: UserLoginPayload | null;
    private _shouldReject: boolean;

    constructor(payload: UserLoginPayload | null, shouldReject: boolean) {
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

    private _isValid: boolean;
    private _verifyCalls: Array<{ password: string; passwordHash: string }> = [];

    constructor(isValid: boolean) {
        this._isValid = isValid;
    }

    public get verifyCalls(): Array<{ password: string; passwordHash: string }> {
        return this._verifyCalls;
    }

    public async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
        this._verifyCalls.push({ password, passwordHash });
        return Promise.resolve(this._isValid);
    }

}

class FakeUserRepository {

    private _user: UserRecord | null;

    constructor(user: UserRecord | null) {
        this._user = user;
    }

    public findByUsername(): Promise<UserRecord | null> {
        return Promise.resolve(this._user);
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

describe(`[Class] LoginRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject invalid credentials`, async () => {
            const parser = new FakeJsonBodyParser({ password: "pass", username: "hero" }, false);
            const hasher = new FakePasswordHasher(false);
            const repository = new FakeUserRepository(null);
            const handler = new LoginRequestHandler(parser, hasher, repository);
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(body).to.deep.equal({ error: "Invalid credentials" });
            expect(hasher.verifyCalls).to.deep.equal([]);
        });

        it(`should return success for valid credentials`, async () => {
            const parser = new FakeJsonBodyParser({ password: "pass", username: "hero" }, false);
            const hasher = new FakePasswordHasher(true);
            const repository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new LoginRequestHandler(parser, hasher, repository);
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(body).to.deep.equal({ message: "Login successful for hero." });
            expect(hasher.verifyCalls).to.deep.equal([
                {
                    password: "pass",
                    passwordHash: "hash"
                }
            ]);
        });

        it(`should reject when the password does not match`, async () => {
            const parser = new FakeJsonBodyParser({ password: "pass", username: "hero" }, false);
            const hasher = new FakePasswordHasher(false);
            const repository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new LoginRequestHandler(parser, hasher, repository);
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(body).to.deep.equal({ error: "Invalid credentials" });
            expect(hasher.verifyCalls).to.deep.equal([
                {
                    password: "pass",
                    passwordHash: "hash"
                }
            ]);
        });

    });

});
