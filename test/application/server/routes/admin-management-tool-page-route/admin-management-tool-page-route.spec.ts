import { AdminManagementToolPageRoute } from "../../../../../src/application/server/routes/admin-management-tool-page-route";
import { type UserRecord } from "../../../../../src/application/server/types/user";
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
        if (body) {
            this._body = body;
        }
    }

    public get headers(): Record<string, string> {
        return this._headers;
    }

    public setHeader(name: string, value: string): void {
        this._headers[name] = value;
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

}

describe(`[Class] AdminManagementToolPageRoute`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject non-admin requests`, async () => {
            const route = new AdminManagementToolPageRoute(new FakeUserRepository({
                email: "user@example.com",
                id: 1,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            }));
            const request = { method: "GET", url: "/admin/manegement-tool?loginToken=token-123" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            const handled = route.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect(handled).to.equal(true);
            expect(response.statusCode).to.equal(403);
            expect(response.headers["Content-Type"]).to.equal("text/plain");
            expect(response.body).to.include("Admin access required.");
        });

        it(`should serve the admin management tool page html`, async () => {
            const route = new AdminManagementToolPageRoute(new FakeUserRepository({
                email: "admin@example.com",
                id: 1,
                isAdmin: true,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "admin"
            }));
            const request = { method: "GET", url: "/admin/manegement-tool?loginToken=token-123" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            const handled = route.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect(handled).to.equal(true);
            expect(response.statusCode).to.equal(200);
            expect(response.headers["Content-Type"]).to.equal("text/html");
            expect(response.body).to.include("Admin management tool");
        });

    });

});


