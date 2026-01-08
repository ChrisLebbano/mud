import { CharacterListRequestHandler } from "../../../../src/application/server/character-list-request-handler";
import { type CharacterRecord } from "../../../../src/application/server/types/character";
import { type UserRecord } from "../../../../src/application/server/types/user";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeCharacterRepository {

    private _characters: CharacterRecord[];

    constructor(characters: CharacterRecord[]) {
        this._characters = characters;
    }

    public findByUserId(_userId: number): Promise<CharacterRecord[]> {
        return Promise.resolve(this._characters);
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

describe(`[Class] CharacterListRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject requests without a login token`, async () => {
            const characterRepository = new FakeCharacterRepository([]);
            const userRepository = new FakeUserRepository(null);
            const handler = new CharacterListRequestHandler(characterRepository, userRepository);
            const request = { method: "GET", url: "/characters" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(401);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Authentication required." });
        });

        it(`should return character names for a valid user`, async () => {
            const characterRepository = new FakeCharacterRepository([
                {
                    className: "Cleric",
                    id: 9,
                    name: "Riley",
                    raceName: "Elf",
                    userId: 12
                },
                {
                    className: "Warrior",
                    id: 10,
                    name: "Alex",
                    raceName: "Human",
                    userId: 12
                }
            ]);
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 12,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CharacterListRequestHandler(characterRepository, userRepository);
            const request = { method: "GET", url: "/characters?loginToken=token-123" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({
                characters: [
                    { id: 9, name: "Riley" },
                    { id: 10, name: "Alex" }
                ]
            });
        });

    });

});
