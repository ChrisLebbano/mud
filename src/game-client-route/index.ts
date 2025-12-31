import { ServerRoute } from "../server-route";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class GameClientRoute extends ServerRoute {

    constructor() {
        const filePath = join(__dirname, "..", "server", "game-client.html");
        const gameClientHtml = readFileSync(filePath, { encoding: "utf-8" });

        super("/game-client", (_request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html");
            response.end(gameClientHtml);
        });
    }

}

