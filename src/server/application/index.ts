import { Server } from "..";
import { World } from "../../game/world";
import { type DatabaseConnectionClient, type ServerConfig } from "../../types";
import { GameClientRoute } from "../game-client-route";
import { ServerRouter } from "../server-router";

export class Application {

    private _databaseConnection: DatabaseConnectionClient;
    private _server?: Server;
    private _serverConfig: ServerConfig;
    private _world: World;

    constructor(serverConfig: ServerConfig, world: World, databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
        this._serverConfig = serverConfig;
        this._world = world;
    }

    public get server(): Server | undefined {
        return this._server;
    }

    public init(): void {
        this._databaseConnection.connect();
        const serverRoutes = [new GameClientRoute()];
        const serverRouter = new ServerRouter(serverRoutes);
        this._server = new Server(this._serverConfig, serverRouter, this._world, this._databaseConnection);
        this._server.start();
    }

}
