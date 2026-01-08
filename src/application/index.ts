import { World } from "../game/world";
import { Server } from "./server";
import { type CharacterClassRepositoryClient } from "./server/types/character-class-repository";
import { type DatabaseConnectionClient } from "./server/types/database";
import { type RaceRepositoryClient } from "./server/types/race-repository";
import { type ServerConfig } from "./server/types/server-config";

export class Application {

    private _databaseConnection: DatabaseConnectionClient;
    private _characterClassRepository?: CharacterClassRepositoryClient;
    private _raceRepository?: RaceRepositoryClient;
    private _server?: Server;
    private _serverConfig: ServerConfig;
    private _world: World;

    constructor(
        serverConfig: ServerConfig,
        world: World,
        databaseConnection: DatabaseConnectionClient,
        raceRepository?: RaceRepositoryClient,
        characterClassRepository?: CharacterClassRepositoryClient
    ) {
        this._databaseConnection = databaseConnection;
        this._serverConfig = serverConfig;
        this._world = world;
        this._raceRepository = raceRepository;
        this._characterClassRepository = characterClassRepository;
    }

    public get server(): Server | undefined {
        return this._server;
    }

    public init(): void {
        this._databaseConnection.connect();
        this._server = new Server(
            this._serverConfig,
            this._world,
            this._databaseConnection,
            undefined,
            undefined,
            this._raceRepository,
            this._characterClassRepository
        );
        this._server.start();
    }

}
