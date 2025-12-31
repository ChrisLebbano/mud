import { createServer } from "node:http";
import { NodeHttpServer } from '../types';

export class NodeHttpServerFactory {

    public static createServer(): NodeHttpServer {

        return createServer((request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/plain");
            response.end("OK");
        });

    }

}

