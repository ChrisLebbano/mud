import { AdminStatusRequestHandler } from "../../../../src/application/server/admin-status-request-handler";
import { type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeUserRepository {

    private _user: UserRecord | null;

    constructor(user: UserRecord | null) {
        this._user = user;
    }

    public findByLoginToken(): Promise<UserRecord | null> {
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

describe(`[Class] AdminStatusRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject requests without a login token`, async () => {
            const userRepository = new FakeUserRepository(null);
            const handler = new AdminStatusRequestHandler(userRepository);
            const request = { method: "GET", url: "/admin/status" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Authentication required." });
        });

        it(`should return admin status for authenticated users`, async () => {
            const userRepository = new FakeUserRepository({
                email: "admin@example.com",
                id: 1,
                isAdmin: true,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "admin"
            });
            const handler = new AdminStatusRequestHandler(userRepository);
            const request = { method: "GET", url: "/admin/status?loginToken=token-123" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ isAdmin: true });
        });

    });

});

