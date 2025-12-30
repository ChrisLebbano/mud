import { ServerConfig } from "../types";
import { Server } from "../server";

export class Application {

    private _server: Server;

    constructor(private serverConfig: ServerConfig) {}

    public init() {
        this._server = new Server(this.serverConfig);
        this._server.start();
    }

    get server(): Server | undefined {
        return this._server;
    }
}