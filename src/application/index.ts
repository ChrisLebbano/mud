import { ServerConfig } from "../types";
import { Server } from "../server";

export class Application {

    private _server: Server;

    constructor(private serverConfig: ServerConfig) {}

    public init() {
        if (!this._server) {
            this._server = new Server(this.serverConfig);
            console.log(`[INFO] Server initialized on port ${this.serverConfig.port}`);
        } else {
            console.log(`[WARN] Server is already initialized on port ${this.serverConfig.port}`);
        }
    }

    get server(): Server | undefined {
        return this._server;
    }
}