import { NodeHttpServerFactory } from "../node-http-server-factory";
import { ServerRoute } from "../server-route";
import { ServerRouter } from "../server-router";
import { SocketServerFactory } from "../socket-server-factory";
import { type NodeHttpServer, type ServerConfig, type SocketServer } from "../types";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class Server {

    private _httpServer?: NodeHttpServer;
    private _serverConfig: ServerConfig;
    private _serverRouter: ServerRouter;
    private _socketServer?: SocketServer;

    constructor(serverConfig: ServerConfig, serverRouter: ServerRouter) {
        const filePath = join(__dirname, "game-client.html");

        this._serverConfig = serverConfig;
        this._serverRouter = serverRouter;
    }

    public start(): NodeHttpServer {
        this._httpServer = NodeHttpServerFactory.createServer((request, response) => {
            this._serverRouter.handle(request, response);
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

