import { CharacterDeleteRequestHandler } from "../../../../src/application/server/character-delete-request-handler";
import { type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

class FakeCharacterRepository {

    private _deleteCalls: Array<{ characterId: number; userId: number }> = [];
    private _deleteResult: boolean;

    constructor(deleteResult: boolean) {
        this._deleteResult = deleteResult;
    }

    public get deleteCalls(): Array<{ characterId: number; userId: number }> {
        return this._deleteCalls;
    }

    public markDeletedById(characterId: number, userId: number): Promise<boolean> {
        this._deleteCalls.push({ characterId, userId });
        return Promise.resolve(this._deleteResult);
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

describe(`[Class] CharacterDeleteRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject unauthenticated deletes`, async () => {
            const repository = new FakeCharacterRepository(false);
            const userRepository = new FakeUserRepository(null);
            const handler = new CharacterDeleteRequestHandler(repository, userRepository);
            const request = createJsonRequest({ characterId: 12, loginToken: "token-123" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Authentication required." });
        });

        it(`should return not found when delete fails`, async () => {
            const repository = new FakeCharacterRepository(false);
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 7,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CharacterDeleteRequestHandler(repository, userRepository);
            const request = createJsonRequest({ characterId: 99, loginToken: "token-123" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(404);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Character not found." });
            expect(repository.deleteCalls).to.deep.equal([{ characterId: 99, userId: 7 }]);
        });

        it(`should delete a character for valid requests`, async () => {
            const repository = new FakeCharacterRepository(true);
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 7,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CharacterDeleteRequestHandler(repository, userRepository);
            const request = createJsonRequest({ characterId: 22, loginToken: "token-123" });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ message: "Character deleted." });
            expect(repository.deleteCalls).to.deep.equal([{ characterId: 22, userId: 7 }]);
        });

    });

});
