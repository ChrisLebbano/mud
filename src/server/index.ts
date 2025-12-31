import { readFileSync } from "node:fs";
import { type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { NodeHttpServerFactory } from "../node-http-server-factory";
import { SocketServerFactory } from "../socket-server-factory";
import { type NodeHttpServer, type ServerConfig, type SocketServer } from "../types";

export class Server {

    private _gameClientHtml: string;
    private _httpServer?: NodeHttpServer;
    private _serverConfig: ServerConfig;
    private _socketServer?: SocketServer;

    constructor(serverConfig: ServerConfig) {
        const filePath = join(__dirname, "game-client.html");
        this._gameClientHtml = readFileSync(filePath, { encoding: "utf-8" });
        this._serverConfig = serverConfig;
    }

    public start(): NodeHttpServer {
        this._httpServer = NodeHttpServerFactory.createServer((request: IncomingMessage, response: ServerResponse) => {
            if (request.url === "/game-client") {
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.end(this._gameClientHtml);
                return;
            }

            response.statusCode = 404;
            response.setHeader("Content-Type", "text/plain");
            response.end("Not Found");
        });

        this._httpServer.on("listening", () => {
            this._socketServer = SocketServerFactory.createSocketIOServer(this._httpServer as NodeHttpServer);
            console.log(`[INFO] Socket Server started`);
        });

        this._httpServer.listen(this._serverConfig.port, () => {
            console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
        });

        return this._httpServer;
    }

}
