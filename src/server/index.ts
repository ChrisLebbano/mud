import { World } from "../game/world";
import { NodeHttpServerFactory } from "./node-http-server-factory";
import { ServerRouter } from "./routes/server-router";
import { SocketServerFactory } from "./socket-server-factory";
import { type DatabaseConnectionClient } from "./types/database";
import { type NodeHttpServer, type SocketServer } from "./types/http";
import { type ServerConfig } from "./types/server-config";
import { UserCommandHandler } from "./user-command-handler";
import { UserRepository } from "./user-repository";

export class Server {

    private _databaseConnection: DatabaseConnectionClient;
    private _httpServer?: NodeHttpServer;
    private _serverConfig: ServerConfig;
    private _serverRouter: ServerRouter;
    private _socketServer?: SocketServer;
    private _userCommandHandler: UserCommandHandler;
    private _userRepository: UserRepository;
    private _world: World;

    constructor(serverConfig: ServerConfig, serverRouter: ServerRouter, world: World, databaseConnection: DatabaseConnectionClient, userRepository: UserRepository, userCommandHandler?: UserCommandHandler) {
        this._databaseConnection = databaseConnection;
        this._serverConfig = serverConfig;
        this._serverRouter = serverRouter;
        this._userRepository = userRepository;
        this._world = world;
        this._userCommandHandler = userCommandHandler ? userCommandHandler : new UserCommandHandler(world);
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

                if (!loginToken) {
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

                const playerName = user.username;
                const joinResult = this._world.addPlayer(socket.id, playerName);

                socket.join(joinResult.roomId);
                socket.emit("world:room", joinResult.roomSnapshot);
                socket.emit("world:system", { category: "System", message: `Welcome, ${playerName}.` });
                socket.to(joinResult.roomId).emit("world:system", { category: "System", message: joinResult.systemMessage });

                socket.on("disconnect", () => {
                    const removedPlayer = this._world.removePlayer(socket.id);
                    if (removedPlayer) {
                        socket.to(removedPlayer.roomId).emit("world:system", { category: "System", message: `${removedPlayer.playerName} has left the room.` });
                    }
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
