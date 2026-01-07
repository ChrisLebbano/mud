import { GameClientRoute } from "../game-client-route";
import { PasswordService } from "../password-service";
import { Server } from "../server";
import { ServerRouter } from "../server-router";
import { TokenService } from "../token-service";
import { type ServerConfig } from "../types";
import { UserAuthenticationService } from "../user-authentication-service";
import { UserRepository } from "../user-repository";
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
        const passwordService = new PasswordService(this._serverConfig.authSecret, 10);
        const tokenService = new TokenService(this._serverConfig.tokenSecret);
        const userRepository = new UserRepository(this._serverConfig.databaseConfig);
        const userAuthenticationService = new UserAuthenticationService(passwordService, tokenService, userRepository);
        this._server = new Server(this._serverConfig, serverRouter, this._world, userAuthenticationService);
        this._server.start();
    }

}
