import { createServer } from "node:http";
import { ServerFactory, ServerInstance } from "../types";

export class HttpServerFactory implements ServerFactory {

    public createServer(): ServerInstance {
        return createServer((request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/plain");
            response.end("OK");
        });
    }

}

