import { JsonBodyParser } from "../../../../src/application/server/json-body-parser";
import { expect } from "chai";
import { type IncomingMessage } from "node:http";
import { Readable } from "node:stream";

describe(`[Class] JsonBodyParser`, () => {

    describe(`[Method] parse`, () => {

        it(`should parse a JSON request body`, async () => {
            const request = Readable.from([JSON.stringify({ email: "test@example.com" })]) as IncomingMessage;

            const result = await JsonBodyParser.parse<{ email: string }>(request);

            expect(result).to.deep.equal({ email: "test@example.com" });
        });

        it(`should reject invalid JSON`, async () => {
            const request = Readable.from(["not-json"]) as IncomingMessage;

            let errorMessage = "";

            try {
                await JsonBodyParser.parse(request);
            } catch (error) {
                errorMessage = error instanceof Error ? error.message : String(error);
            }

            expect(errorMessage).to.not.equal("");
        });

    });

});

