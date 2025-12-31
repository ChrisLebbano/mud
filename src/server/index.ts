import { HttpServerFactory } from "../http-server-factory";
import { SocketServerFactory } from "../socket-server-factory";
import { ServerConfig, ServerFactory, ServerInstance, SocketServerFactory as SocketServerFactoryType, SocketServerInstance } from "../types";

export class Server {

    private _server?: ServerInstance;
    private _serverConfig: ServerConfig;
    private _serverFactory: ServerFactory;
    private _socketServer?: SocketServerInstance;
    private _socketServerFactory: SocketServerFactoryType;

    constructor(serverConfig: ServerConfig, serverFactory?: ServerFactory, socketServerFactory?: SocketServerFactoryType) {
        this._serverConfig = serverConfig;
        this._serverFactory = serverFactory ?? new HttpServerFactory();
        this._socketServerFactory = socketServerFactory ?? new SocketServerFactory();
    }

    public start(): ServerInstance {
        if (!this._server) {
            this._server = this._serverFactory.createServer();
            this._server.on("listening", () => {
                this._socketServer = this._socketServerFactory.createServer(this._server as ServerInstance);
                console.log(`[INFO] Socket Server started`);
            });
            this._server.listen(this._serverConfig.port, () => {
                console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
            });
        } else {
            console.log(`[WARN] Server already started on port ${this._serverConfig.port}`);
        }

        return this._server;
    }

}
