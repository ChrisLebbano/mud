import { MethodServerRoute } from "../../../src/server/method-server-route";
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

describe(`[Class] MethodServerRoute`, () => {

    describe(`[Method] matches`, () => {

        it(`should return true when the request url and method match`, () => {
            const route = new MethodServerRoute("/signup", "POST", () => undefined);
            const request = { method: "POST", url: "/signup" } as IncomingMessage;

            const matches = route.matches(request);

            expect(matches).to.equal(true);
        });

        it(`should return false when the request method does not match`, () => {
            const route = new MethodServerRoute("/signup", "POST", () => undefined);
            const request = { method: "GET", url: "/signup" } as IncomingMessage;

            const matches = route.matches(request);

            expect(matches).to.equal(false);
        });

    });

    describe(`[Method] handle`, () => {

        it(`should skip the handler when the route does not match the method`, () => {
            let handlerCalled = false;
            const route = new MethodServerRoute("/signup", "POST", () => {
                handlerCalled = true;
            });

            const request = { method: "GET", url: "/signup" } as IncomingMessage;
            const response = new FakeResponse() as unknown as ServerResponse;

            const handled = route.handle(request, response);

            expect(handled).to.equal(false);
            expect(handlerCalled).to.equal(false);
        });

    });

});

