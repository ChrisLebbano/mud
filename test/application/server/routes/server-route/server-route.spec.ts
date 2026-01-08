import { ServerRoute } from "../../../../../src/application/server/routes/server-route";
import { expect } from "chai";
import { type IncomingMessage, type ServerResponse } from "node:http";

class FakeResponse {

    private _statusCode = 0;

    public get statusCode(): number {
        return this._statusCode;
    }

    public set statusCode(statusCode: number) {
        this._statusCode = statusCode;
    }

}

describe(`[Class] ServerRoute`, () => {

    describe(`[Method] handle`, () => {

        it(`should execute the handler when the route matches`, () => {
            let handlerCalled = false;
            const route = new ServerRoute("/game-client", () => {
                handlerCalled = true;
            });

            const request = { url: "/game-client" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            const handled = route.handle(request, response);

            expect(handled).to.equal(true);
            expect(handlerCalled).to.equal(true);
        });

        it(`should skip the handler when the route does not match`, () => {
            let handlerCalled = false;
            const route = new ServerRoute("/game-client", () => {
                handlerCalled = true;
            });

            const request = { url: "/other" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            const handled = route.handle(request, response);

            expect(handled).to.equal(false);
            expect(handlerCalled).to.equal(false);
        });

    });

    describe(`[Method] matches`, () => {

        it(`should return true when the request url matches the route`, () => {
            const route = new ServerRoute("/game-client", () => undefined);
            const request = { url: "/game-client" } as IncomingMessage;

            const matches = route.matches(request);

            expect(matches).to.equal(true);
        });

    });

});
