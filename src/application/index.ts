import { GameClientRoute } from "../game-client-route";
import { Server } from "../server";
import { ServerRouter } from "../server-router";
import { type ServerConfig } from "../types";
import { World } from "../world";

export class Application {

    private _server?: Server;
    private _serverConfig: ServerConfig;
    private _world: World;

    constructor(serverConfig: ServerConfig, world: World) {
        this._serverConfig = serverConfig;
        this._world = world;
    }

    public get server(): Server | undefined {
        return this._server;
    }

    public init(): void {
        const serverRoutes = [new GameClientRoute()];
        const serverRouter = new ServerRouter(serverRoutes);
        this._server = new Server(this._serverConfig, serverRouter, this._world);
        this._server.start();
    }

}
