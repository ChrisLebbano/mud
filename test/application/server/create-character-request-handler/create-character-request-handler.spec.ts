import { CreateCharacterRequestHandler } from "../../../../src/application/server/create-character-request-handler";
import { type CharacterRecord } from "../../../../src/application/server/types/character";
import { type RaceRecord } from "../../../../src/application/server/types/race";
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

    public findByName(_name: string): Promise<CharacterRecord | null> {
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

class FakeRaceRepository {

    private _race: RaceRecord | null;

    constructor(race: RaceRecord | null) {
        this._race = race;
    }

    public findByName(_name: string): Promise<RaceRecord | null> {
        return Promise.resolve(this._race);
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
            const raceRepository = new FakeRaceRepository(null);
            const userRepository = new FakeUserRepository(null);
            const handler = new CreateCharacterRequestHandler(repository, raceRepository, userRepository);
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
            const raceRepository = new FakeRaceRepository(null);
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CreateCharacterRequestHandler(repository, raceRepository, userRepository);
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

        it(`should reject non-player races`, async () => {
            const repository = new FakeCharacterRepository(null);
            const raceRepository = new FakeRaceRepository({
                baseAttributes: {
                    agility: 9,
                    charisma: 8,
                    constitution: 12,
                    dexterity: 9,
                    health: 0,
                    intelligence: 9,
                    mana: 14,
                    perception: 11,
                    resolve: 9,
                    strength: 12,
                    wisdom: 8
                },
                baseHealth: 10,
                description: "Wilder kin.",
                id: 3,
                name: "Creature",
                playerCharacterAllowed: false,
                raceKey: "creature"
            });
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CreateCharacterRequestHandler(repository, raceRepository, userRepository);
            const request = createJsonRequest({
                characterClassName: "Warrior",
                characterName: "Alex",
                characterRaceName: "Creature",
                loginToken: "token-123"
            });
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            const body = JSON.parse((response as unknown as FakeResponse).body);

            expect((response as unknown as FakeResponse).statusCode).to.equal(400);
            expect(body).to.deep.equal({ error: "Selected race is not available for player characters." });
            expect(repository.createCalls).to.deep.equal([]);
        });

        it(`should create a character when data is valid`, async () => {
            const repository = new FakeCharacterRepository(null);
            const raceRepository = new FakeRaceRepository({
                baseAttributes: {
                    agility: 10,
                    charisma: 12,
                    constitution: 10,
                    dexterity: 10,
                    health: 0,
                    intelligence: 10,
                    mana: 22,
                    perception: 10,
                    resolve: 10,
                    strength: 10,
                    wisdom: 10
                },
                baseHealth: 10,
                description: "Versatile adventurers.",
                id: 1,
                name: "Human",
                playerCharacterAllowed: true,
                raceKey: "human"
            });
            const userRepository = new FakeUserRepository({
                email: "hero@example.com",
                id: 1,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            const handler = new CreateCharacterRequestHandler(repository, raceRepository, userRepository);
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

