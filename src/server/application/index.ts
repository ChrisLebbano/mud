import { Server } from "..";
import { World } from "../../game/world";
import { CharacterNameValidator } from "../character-name-validator";
import { CharacterRepository } from "../character-repository";
import { CreateCharacterPageRoute } from "../create-character-page-route";
import { CreateCharacterRequestHandler } from "../create-character-request-handler";
import { GameClientRoute } from "../game-client-route";
import { JsonBodyParser } from "../json-body-parser";
import { LoginPageRoute } from "../login-page-route";
import { LoginRequestHandler } from "../login-request-handler";
import { LoginTokenGenerator } from "../login-token-generator";
import { MethodServerRoute } from "../method-server-route";
import { PasswordHasher } from "../password-hasher";
import { RootPageRoute } from "../root-page-route";
import { ServerRouter } from "../server-router";
import { SignupPageRoute } from "../signup-page-route";
import { SignupRequestHandler } from "../signup-request-handler";
import { type DatabaseConnectionClient } from "../types/database";
import { type ServerConfig } from "../types/server-config";
import { UserRepository } from "../user-repository";

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
        const jsonBodyParser = new JsonBodyParser();
        const characterNameValidator = new CharacterNameValidator();
        const loginTokenGenerator = new LoginTokenGenerator();
        const passwordHasher = new PasswordHasher();
        const characterRepository = new CharacterRepository(this._databaseConnection);
        const userRepository = new UserRepository(this._databaseConnection);
        const createCharacterRequestHandler = new CreateCharacterRequestHandler(
            jsonBodyParser,
            characterNameValidator,
            characterRepository,
            userRepository
        );
        const loginRequestHandler = new LoginRequestHandler(jsonBodyParser, loginTokenGenerator, passwordHasher, userRepository);
        const signupRequestHandler = new SignupRequestHandler(jsonBodyParser, passwordHasher, userRepository);
        const serverRoutes = [
            new RootPageRoute(),
            new CreateCharacterPageRoute(),
            new GameClientRoute(),
            new LoginPageRoute(),
            new SignupPageRoute(),
            new MethodServerRoute("/api/characters", "POST", createCharacterRequestHandler.handle.bind(createCharacterRequestHandler)),
            new MethodServerRoute("/characters", "POST", createCharacterRequestHandler.handle.bind(createCharacterRequestHandler)),
            new MethodServerRoute("/login", "POST", loginRequestHandler.handle.bind(loginRequestHandler)),
            new MethodServerRoute("/signup", "POST", signupRequestHandler.handle.bind(signupRequestHandler))
        ];
        const serverRouter = new ServerRouter(serverRoutes);
        this._server = new Server(this._serverConfig, serverRouter, this._world, this._databaseConnection, userRepository);
        this._server.start();
    }

}
