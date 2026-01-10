import { AdminCharacterDeleteRequestHandler } from "../../../../src/application/server/admin-character-delete-request-handler";
import { type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

class FakeCharacterRepository {

    private _deleted: boolean;

    constructor(deleted: boolean) {
        this._deleted = deleted;
    }

    public markDeletedByIdForAdmin(): Promise<boolean> {
        return Promise.resolve(this._deleted);
    }

}

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

const createJsonRequest = (payload: unknown): IncomingMessage => {
    const request = Readable.from([JSON.stringify(payload)]) as IncomingMessage;
    request.method = "DELETE";
    return request;
};

describe(`[Class] AdminCharacterDeleteRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject non-admin users`, async () => {
            const characterRepository = new FakeCharacterRepository(true);
            const userRepository = new FakeUserRepository({
                email: "user@example.com",
                id: 44,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new AdminCharacterDeleteRequestHandler(characterRepository, userRepository);
            const request = createJsonRequest({ characterId: 12, loginToken: "token-123" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(403);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Admin access required." });
        });

        it(`should delete a character for admins`, async () => {
            const characterRepository = new FakeCharacterRepository(true);
            const userRepository = new FakeUserRepository({
                email: "admin@example.com",
                id: 1,
                isAdmin: true,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "admin"
            });
            const handler = new AdminCharacterDeleteRequestHandler(characterRepository, userRepository);
            const request = createJsonRequest({ characterId: 12, loginToken: "token-123" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ message: "Character deleted." });
        });

    });

});


