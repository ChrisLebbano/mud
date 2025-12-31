import { GameClientRoute } from "../../src/game-client-route";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

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

describe(`[Class] GameClientRoute`, () => {

    describe(`[Method] handle`, () => {

        it(`should serve the game client html`, () => {
            const route = new GameClientRoute();
            const request = { url: "/game-client" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            const handled = route.handle(request, response);

            expect(handled).to.equal(true);
            expect(response.statusCode).to.equal(200);
            expect(response.headers["Content-Type"]).to.equal("text/html");
            expect(response.body).to.include("Game Client");
        });

    });

});

