import {NodeHttpServer, ServerConfig, SocketServer} from "../types";
import { NodeHttpServerFactory } from "../node-http-server-factory";
import { SocketServerFactory } from "../socket-server-factory";

export class Server {

    private _httpServer: NodeHttpServer;
    private _socketServer: SocketServer;
    private _serverConfig: ServerConfig;

    constructor(
        serverConfig: ServerConfig
    ) {
        this._serverConfig = serverConfig;
    }

    public start() {
        this._httpServer = NodeHttpServerFactory.createServer();
        this._httpServer.on("listening", () => {
            this._socketServer = SocketServerFactory.createSocketIOServer(this._httpServer);
            console.log(`[INFO] Socket Server started`);
        });
        this._httpServer.listen(this._serverConfig.port, () => {
            console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
        });
    }

}
