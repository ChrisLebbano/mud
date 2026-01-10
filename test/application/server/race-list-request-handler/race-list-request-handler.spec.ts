import { RaceListRequestHandler } from "../../../../src/application/server/race-list-request-handler";
import { type RaceRecord } from "../../../../src/application/server/types/race";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeRaceRepository {

    private _races: RaceRecord[];

    constructor(races: RaceRecord[]) {
        this._races = races;
    }

    public findAll(): Promise<RaceRecord[]> {
        return Promise.resolve(this._races);
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

describe(`[Class] RaceListRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject non-GET requests`, async () => {
            const handler = new RaceListRequestHandler(new FakeRaceRepository([]));
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(405);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Method not allowed." });
        });

        it(`should return races`, async () => {
            const handler = new RaceListRequestHandler(new FakeRaceRepository([
                {
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
                }
            ]));
            const request = { method: "GET" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({
                races: [
                    {
                        description: "Versatile adventurers.",
                        id: 1,
                        name: "Human",
                        playerCharacterAllowed: true
                    }
                ]
            });
        });

    });

});

