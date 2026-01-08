import { CharacterClassListRequestHandler } from "../../../../src/application/server/character-class-list-request-handler";
import { type CharacterClassRecord } from "../../../../src/application/server/types/character-class";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeCharacterClassRepository {

    private _classes: CharacterClassRecord[];

    constructor(classes: CharacterClassRecord[]) {
        this._classes = classes;
    }

    public findAll(): Promise<CharacterClassRecord[]> {
        return Promise.resolve(this._classes);
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

describe(`[Class] CharacterClassListRequestHandler`, () => {

    describe(`[Method] handle`, () => {

        it(`should reject non-GET requests`, async () => {
            const handler = new CharacterClassListRequestHandler(new FakeCharacterClassRepository([]));
            const request = { method: "POST" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(405);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({ error: "Method not allowed." });
        });

        it(`should return classes`, async () => {
            const handler = new CharacterClassListRequestHandler(new FakeCharacterClassRepository([
                {
                    description: "Disciplined fighters.",
                    id: 3,
                    name: "Fighter"
                }
            ]));
            const request = { method: "GET" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            handler.handle(request, response);

            await new Promise((resolve) => setImmediate(resolve));

            expect((response as unknown as FakeResponse).statusCode).to.equal(200);
            expect(JSON.parse((response as unknown as FakeResponse).body)).to.deep.equal({
                classes: [
                    {
                        description: "Disciplined fighters.",
                        id: 3,
                        name: "Fighter"
                    }
                ]
            });
        });

    });

});

