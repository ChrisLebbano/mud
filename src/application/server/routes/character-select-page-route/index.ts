import { MethodServerRoute } from "../method-server-route";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class CharacterSelectPageRoute extends MethodServerRoute {

    constructor() {
        const filePath = join(__dirname, ".", "character-select-page.html");
        const characterSelectPageHtml = readFileSync(filePath, { encoding: "utf-8" });

        super("/character/select", "GET", (_request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html");
            response.end(characterSelectPageHtml);
        });
    }

}

