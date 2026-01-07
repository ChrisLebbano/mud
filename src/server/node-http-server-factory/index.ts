import { type HttpRequestHandler, type NodeHttpServer } from "../../types";
import { createServer } from "node:http";

export class NodeHttpServerFactory {

    public static createServer(handler: HttpRequestHandler): NodeHttpServer {
        return createServer(handler);
    }

}
