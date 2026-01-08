import { ServerRoute } from "../../../../src/server/routes/server-route";
import { ServerRouter } from "../../../../src/server/routes/server-router";
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

describe(`[Class] ServerRouter`, () => {

    describe(`[Method] addRoute`, () => {

        it(`should register routes used during handling`, () => {
            const router = new ServerRouter([]);
            const route = new ServerRoute("/game-client", (_request, response) => {
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/plain");
                response.end("Handled");
            });

            router.addRoute(route);

            const request = { url: "/game-client" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            router.handle(request, response);

            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal("Handled");
        });

    });

    describe(`[Method] handle`, () => {

        it(`should respond with a 404 when no routes match`, () => {
            const router = new ServerRouter([]);
            const request = { url: "/missing" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            router.handle(request, response);

            expect(response.statusCode).to.equal(404);
            expect(response.headers["Content-Type"]).to.equal("text/plain");
            expect(response.body).to.equal("Not Found");
        });

    });

});
