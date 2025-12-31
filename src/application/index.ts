import { Server } from "../server";
import { ServerRouter } from "../server-router";
import { type ServerConfig } from "../types";

export class Application {

    private _server?: Server;
    private _serverConfig: ServerConfig;

    constructor(serverConfig: ServerConfig) {
        this._serverConfig = serverConfig;
    }

    public get server(): Server | undefined {
        return this._server;
    }

    public init(): void {
        const serverRouter = new ServerRouter([]);
        this._server = new Server(this._serverConfig, serverRouter);
        this._server.start();
    }

}

