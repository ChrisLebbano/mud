import { CreateCharacterRequestHandler } from "../../../../src/application/server/create-character-request-handler";
import { type CharacterRecord } from "../../../../src/application/server/types/character";
import { type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

class FakeCharacterRepository {

    private _createCalls: Array<{ className: string; name: string; raceName: string; userId: number }> = [];
    private _existingCharacter: CharacterRecord | null;

    constructor(existingCharacter: CharacterRecord | null) {
        this._existingCharacter = existingCharacter;
    }

    public get createCalls(): Array<{ className: string; name: string; raceName: string; userId: number }> {
        return this._createCalls;
    }

    public createCharacter(data: { className: string; name: string; raceName: string; userId: number }): Promise<CharacterRecord> {
        this._createCalls.push(data);
        return Promise.resolve({
            className: data.className,
            id: 22,
            name: data.name,
            raceName: data.raceName,
            userId: data.userId
        });
    }

    public findByName(): Promise<CharacterRecord | null> {
        return Promise.resolve(this._existingCharacter);
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
    request.method = "POST";
    return request;
};

describe(`[Class] CreateCharacterRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject when authentication fails`, async () => {
            const repository = new FakeCharacterRepository(null);
            const userRepository = new FakeUserRepository(null);
            const handler = new CreateCharacterRequestHandler(repository, userRepository);
            const request = createJsonRequest({
                characterClassName: "Warrior",
                characterName: "Alex",
                characterRaceName: "Human",
                loginToken: "token-123"
            });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(body).to.deep.equal({ error: "Authentication required." });
            expect(repository.createCalls).to.deep.equal([]);
        });

        it(`should reject invalid character names`, async () => {
            const repository = new FakeCharacterRepository(null);
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CreateCharacterRequestHandler(repository, userRepository);
            const request = createJsonRequest({
                characterClassName: "Warrior",
                characterName: "A1",
                characterRaceName: "Human",
                loginToken: "token-123"
            });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(400);
            expect(body).to.deep.equal({ error: "Character name must be one word with letters only." });
            expect(repository.createCalls).to.deep.equal([]);
        });

        it(`should create a character when data is valid`, async () => {
            const repository = new FakeCharacterRepository(null);
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CreateCharacterRequestHandler(repository, userRepository);
            const request = createJsonRequest({
                characterClassName: "Warrior",
                characterName: "Alex",
                characterRaceName: "Human",
                loginToken: "token-123"
            });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(201);
            expect(body).to.deep.equal({
                character: {
                    className: "Warrior",
                    id: 22,
                    name: "Alex",
                    raceName: "Human"
                },
                message: "Character created."
            });
            expect(repository.createCalls).to.deep.equal([
                {
                    className: "Warrior",
                    name: "Alex",
                    raceName: "Human",
                    userId: 1
                }
            ]);
        });

    });

});
