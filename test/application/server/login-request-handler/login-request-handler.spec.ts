import { LoginRequestHandler } from "../../../../src/application/server/login-request-handler";
import { PasswordHasher } from "../../../../src/application/server/password-hasher";
import { type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

class FakeUserRepository {

    private _updateCalls: Array<{ lastLoginOn: Date; loginToken: string; userId: number }> = [];
    private _user: UserRecord | null;

    constructor(user: UserRecord | null) {
        this._user = user;
    }

    public findByUsername(): Promise<UserRecord | null> {
        return Promise.resolve(this._user);
    }

    public get updateCalls(): Array<{ lastLoginOn: Date; loginToken: string; userId: number }> {
        return this._updateCalls;
    }

    public updateLoginToken(userId: number, loginToken: string, lastLoginOn: Date): Promise<void> {
        this._updateCalls.push({ lastLoginOn, loginToken, userId });
        return Promise.resolve();
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

describe(`[Class] LoginRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject invalid credentials`, async () => {
            const repository = new FakeUserRepository(null);
            const handler = new LoginRequestHandler(repository);
            const request = createJsonRequest({ password: "pass", username: "hero" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(body).to.deep.equal({ error: "Invalid credentials" });
            expect(repository.updateCalls).to.deep.equal([]);
        });

        it(`should return success for valid credentials`, async () => {
            const passwordHasher = new PasswordHasher();
            const passwordHash = await passwordHasher.hashPassword("pass");
            const repository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                lastLoginOn: null,
                loginToken: null,
                passwordHash,
                username: "hero"
            });
            const handler = new LoginRequestHandler(repository);
            const request = createJsonRequest({ password: "pass", username: "hero" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body) as { loginToken: string; message: string };

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(body.message).to.equal("Login successful for hero.");
            expect(body.loginToken).to.be.a("string");
            expect(repository.updateCalls).to.have.lengthOf(1);
            expect(repository.updateCalls[0].loginToken).to.equal(body.loginToken);
            expect(repository.updateCalls[0].userId).to.equal(1);
            expect(repository.updateCalls[0].lastLoginOn).to.be.instanceOf(Date);
        });

        it(`should reject when the password does not match`, async () => {
            const passwordHasher = new PasswordHasher();
            const passwordHash = await passwordHasher.hashPassword("not-pass");
            const repository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                lastLoginOn: null,
                loginToken: null,
                passwordHash,
                username: "hero"
            });
            const handler = new LoginRequestHandler(repository);
            const request = createJsonRequest({ password: "pass", username: "hero" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(body).to.deep.equal({ error: "Invalid credentials" });
            expect(repository.updateCalls).to.deep.equal([]);
        });

    });

});

