import { HttpServerFactory } from "../http-server-factory";
import { ServerConfig, ServerFactory, ServerInstance } from "../types";

export class Server {

    private _server?: ServerInstance;
    private _serverConfig: ServerConfig;
    private _serverFactory: ServerFactory;

    constructor(serverConfig: ServerConfig, serverFactory: ServerFactory = new HttpServerFactory()) {
        this._serverConfig = serverConfig;
        this._serverFactory = serverFactory;
    }

    public start(): ServerInstance {
        if (!this._server) {
            this._server = this._serverFactory.createServer();
            this._server.listen(this._serverConfig.port, () => {
                console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
            });
        } else {
            console.log(`[WARN] Server already started on port ${this._serverConfig.port}`);
        }

        return this._server;
    }

}
