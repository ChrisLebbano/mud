import { MethodServerRoute } from "../method-server-route";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class CreateCharacterPageRoute extends MethodServerRoute {

    constructor() {
        const filePath = join(__dirname, ".", "create-character-page.html");
        const createCharacterPageHtml = readFileSync(filePath, { encoding: "utf-8" });

        super("/characters/create", "GET", (_request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html");
            response.end(createCharacterPageHtml);
        });
    }

}
