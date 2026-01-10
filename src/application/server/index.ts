import { World } from "../../game/world";
import { AdminCharacterDeleteRequestHandler } from "./admin-character-delete-request-handler";
import { AdminCharacterListRequestHandler } from "./admin-character-list-request-handler";
import { AdminStatusRequestHandler } from "./admin-status-request-handler";
import { CharacterClassListRequestHandler } from "./character-class-list-request-handler";
import { CharacterClassRepository } from "./character-class-repository";
import { CharacterDeleteRequestHandler } from "./character-delete-request-handler";
import { CharacterListRequestHandler } from "./character-list-request-handler";
import { CharacterRepository } from "./character-repository";
import { CreateCharacterRequestHandler } from "./create-character-request-handler";
import { LoginRequestHandler } from "./login-request-handler";
import { NodeHttpServerFactory } from "./node-http-server-factory";
import { RaceListRequestHandler } from "./race-list-request-handler";
import { RaceRepository } from "./race-repository";
import { AdminManagementToolPageRoute } from "./routes/admin-management-tool-page-route";
import { CharacterSelectPageRoute } from "./routes/character-select-page-route";
import { CreateCharacterPageRoute } from "./routes/create-character-page-route";
import { GameClientRoute } from "./routes/game-client-route";
import { LoginPageRoute } from "./routes/login-page-route";
import { MethodServerRoute } from "./routes/method-server-route";
import { RootPageRoute } from "./routes/root-page-route";
import { ServerRouter } from "./routes/server-router";
import { SignupPageRoute } from "./routes/signup-page-route";
import { SignupRequestHandler } from "./signup-request-handler";
import { SocketServerFactory } from "./socket-server-factory";
import { type DatabaseConnectionClient } from "./types/database";
import { type NodeHttpServer, type SocketServer } from "./types/http";
import { type ServerConfig } from "./types/server-config";
import { UserCommandHandler } from "./user-command-handler";
import { UserRepository } from "./user-repository";

export class Server {

    private _characterRepository: CharacterRepository;
    private _characterClassRepository: CharacterClassRepository;
    private _databaseConnection: DatabaseConnectionClient;
    private _disconnectGracePeriodMs: number;
    private _disconnectSocketIds: Map<number, string>;
    private _disconnectTimeouts: Map<number, NodeJS.Timeout>;
    private _httpServer?: NodeHttpServer;
    private _raceRepository: RaceRepository;
    private _serverConfig: ServerConfig;
    private _serverRouter: ServerRouter;
    private _socketServer?: SocketServer;
    private _userCommandHandler: UserCommandHandler;
    private _userRepository: UserRepository;
    private _world: World;

    constructor(
        serverConfig: ServerConfig,
        world: World,
        databaseConnection: DatabaseConnectionClient,
        userRepository?: UserRepository,
        characterRepository?: CharacterRepository,
        raceRepository?: RaceRepository,
        characterClassRepository?: CharacterClassRepository
    ) {
        this._databaseConnection = databaseConnection;
        this._disconnectGracePeriodMs = 30000;
        this._disconnectSocketIds = new Map();
        this._disconnectTimeouts = new Map();
        this._serverConfig = serverConfig;
        this._world = world;
        this._characterRepository = characterRepository ? characterRepository : new CharacterRepository(databaseConnection);
        this._raceRepository = raceRepository ? raceRepository : new RaceRepository(databaseConnection);
        this._characterClassRepository = characterClassRepository
            ? characterClassRepository
            : new CharacterClassRepository(databaseConnection);
        this._userRepository = userRepository ? userRepository : new UserRepository(databaseConnection);
        this._userCommandHandler = new UserCommandHandler(world);

        const adminCharacterDeleteRequestHandler = new AdminCharacterDeleteRequestHandler(
            this._characterRepository,
            this._userRepository
        );
        const adminCharacterListRequestHandler = new AdminCharacterListRequestHandler(
            this._characterRepository,
            this._userRepository
        );
        const adminStatusRequestHandler = new AdminStatusRequestHandler(this._userRepository);
        const createCharacterRequestHandler = new CreateCharacterRequestHandler(
            this._characterRepository,
            this._raceRepository,
            this._userRepository
        );
        const characterListRequestHandler = new CharacterListRequestHandler(
            this._characterRepository,
            this._userRepository
        );
        const characterDeleteRequestHandler = new CharacterDeleteRequestHandler(
            this._characterRepository,
            this._userRepository
        );
        const loginRequestHandler = new LoginRequestHandler(this._userRepository);
        const raceListRequestHandler = new RaceListRequestHandler(this._raceRepository);
        const characterClassListRequestHandler = new CharacterClassListRequestHandler(this._characterClassRepository);
        const signupRequestHandler = new SignupRequestHandler(this._userRepository);
        const serverRoutes = [
            new RootPageRoute(),
            new AdminManagementToolPageRoute(this._userRepository),
            new CharacterSelectPageRoute(),
            new CreateCharacterPageRoute(),
            new GameClientRoute(),
            new LoginPageRoute(),
            new SignupPageRoute(),
            new MethodServerRoute(
                "/admin/characters",
                "DELETE",
                adminCharacterDeleteRequestHandler.handle.bind(adminCharacterDeleteRequestHandler)
            ),
            new MethodServerRoute(
                "/admin/characters",
                "GET",
                adminCharacterListRequestHandler.handle.bind(adminCharacterListRequestHandler)
            ),
            new MethodServerRoute(
                "/admin/status",
                "GET",
                adminStatusRequestHandler.handle.bind(adminStatusRequestHandler)
            ),
            new MethodServerRoute("/races", "GET", raceListRequestHandler.handle.bind(raceListRequestHandler)),
            new MethodServerRoute("/classes", "GET", characterClassListRequestHandler.handle.bind(characterClassListRequestHandler)),
            new MethodServerRoute("/characters", "GET", characterListRequestHandler.handle.bind(characterListRequestHandler)),
            new MethodServerRoute("/characters", "POST", createCharacterRequestHandler.handle.bind(createCharacterRequestHandler)),
            new MethodServerRoute("/characters", "DELETE", characterDeleteRequestHandler.handle.bind(characterDeleteRequestHandler)),
            new MethodServerRoute("/login", "POST", loginRequestHandler.handle.bind(loginRequestHandler)),
            new MethodServerRoute("/signup", "POST", signupRequestHandler.handle.bind(signupRequestHandler))
        ];
        this._serverRouter = new ServerRouter(serverRoutes);
    }

    private configureSocketServer(): void {
        if (!this._socketServer) {
            return;
        }

        this._socketServer.on("connection", (socket) => {
            const run = async (): Promise<void> => {
                const loginToken = typeof socket.handshake?.auth?.loginToken === "string"
                    ? socket.handshake.auth.loginToken.trim()
                    : "";
                const characterName = typeof socket.handshake?.auth?.characterName === "string"
                    ? socket.handshake.auth.characterName.trim()
                    : "";

                if (!loginToken || !characterName) {
                    socket.emit("world:system", { category: "System", message: "Authentication required." });
                    socket.disconnect();
                    return;
                }

                const user = await this._userRepository.findByLoginToken(loginToken);
                if (!user) {
                    socket.emit("world:system", { category: "System", message: "Authentication required." });
                    socket.disconnect();
                    return;
                }

                const character = await this._characterRepository.findByName(characterName);
                if (!character || character.userId !== user.id) {
                    socket.emit("world:system", { category: "System", message: "Authentication required." });
                    socket.disconnect();
                    return;
                }

                const pendingTimeout = this._disconnectTimeouts.get(user.id);
                if (pendingTimeout) {
                    clearTimeout(pendingTimeout);
                    this._disconnectTimeouts.delete(user.id);
                    const pendingSocketId = this._disconnectSocketIds.get(user.id);
                    if (pendingSocketId) {
                        const removedPlayer = this._world.removePlayer(pendingSocketId);
                        if (removedPlayer) {
                            this._socketServer?.to(removedPlayer.roomId).emit("world:system", {
                                category: "System",
                                message: `${removedPlayer.playerName} has left the room.`
                            });
                        }
                    }
                    this._disconnectSocketIds.delete(user.id);
                }

                const joinResult = this._world.addPlayer(socket.id, character.name, character.raceName, character.className);

                socket.join(joinResult.roomId);
                socket.emit("world:room", joinResult.roomSnapshot);
                socket.emit("world:system", { category: "System", message: `Welcome, ${character.name}.` });
                socket.to(joinResult.roomId).emit("world:system", { category: "System", message: joinResult.systemMessage });

                socket.on("disconnect", () => {
                    console.log(`[INFO] User disconnected: ${character.name} (${socket.id})`);
                    this.handleDisconnect(user.id, socket.id);
                });

                socket.on("submit", (command) => {
                    console.log(`[INFO] Received command: ${command}`);
                    this._userCommandHandler.handleCommand(socket, command);
                });
            };

            void run().catch((error: unknown) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[ERROR] Socket authentication failed: ${message}`);
                socket.disconnect();
            });
        });
    }

    private handleDisconnect(userId: number, socketId: string): void {
        const existingTimeout = this._disconnectTimeouts.get(userId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        this._disconnectSocketIds.set(userId, socketId);
        const timeout = setTimeout(() => {
            this._disconnectTimeouts.delete(userId);
            this._disconnectSocketIds.delete(userId);
            const removedPlayer = this._world.removePlayer(socketId);
            if (removedPlayer) {
                this._socketServer?.to(removedPlayer.roomId).emit("world:system", {
                    category: "System",
                    message: `${removedPlayer.playerName} has left the room.`
                });
            }

            const runCleanup = async (): Promise<void> => {
                await this._userRepository.clearLoginToken(userId);
                console.log(`[INFO] Cleared login token for user ${userId} after disconnect.`);
            };

            void runCleanup().catch((error: unknown) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[ERROR] Failed to clear login token for user ${userId}: ${message}`);
            });
        }, this._disconnectGracePeriodMs);

        this._disconnectTimeouts.set(userId, timeout);
    }

    public start(): NodeHttpServer {
        this._httpServer = NodeHttpServerFactory.createServer((request, response) => {
            this._serverRouter.handle(request, response);
        });

        this._httpServer.on("listening", () => {
            this._socketServer = SocketServerFactory.createSocketIOServer(this._httpServer as NodeHttpServer);
            this._userCommandHandler.setSocketServer(this._socketServer);
            this.configureSocketServer();
            console.log(`[INFO] Socket Server started`);
        });

        this._httpServer.listen(this._serverConfig.port, () => {
            console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
            void this._databaseConnection.testConnection("server listening");
        });

        return this._httpServer;
    }

}
