import { NodeHttpServerFactory } from "../node-http-server-factory";
import { NonPlayerCharacter } from "../non-player-character";
import { Room } from "../room";
import { ServerRouter } from "../server-router";
import { SocketServerFactory } from "../socket-server-factory";
import { type NodeHttpServer, type ServerConfig, type SocketServer } from "../types";
import { UserCommandHandler } from "../user-command-handler";
import { World } from "../world";
import { Zone } from "../zone";

export class Server {

    private _httpServer?: NodeHttpServer;
    private _serverConfig: ServerConfig;
    private _serverRouter: ServerRouter;
    private _socketServer?: SocketServer;
    private _userCommandHandler: UserCommandHandler;
    private _world: World;

    constructor(serverConfig: ServerConfig, serverRouter: ServerRouter, world?: World, userCommandHandler?: UserCommandHandler) {
        this._serverConfig = serverConfig;
        this._serverRouter = serverRouter;
        this._world = world ? world : new World([
            new Zone("starter-zone", "Starter Zone", [
                new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", {
                    east: "library",
                    north: "lounge",
                    west: "workshop"
                }, [
                    new NonPlayerCharacter("npc-guide", "Terminal Guide", "atrium", "Welcome to the terminal atrium. Need a hand getting started?")
                ]),
                new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", {
                    north: "observatory",
                    south: "atrium"
                }, [
                    new NonPlayerCharacter("npc-analyst", "Caffeinated Analyst", "lounge")
                ]),
                new Room("library", "Library", "A hushed library of holographic shelves and whispering index lights.", { west: "atrium" }, [
                    new NonPlayerCharacter("npc-librarian", "Archivist Imani", "library")
                ]),
                new Room("workshop", "Workshop", "A workshop lined with humming tools and half-built drones.", {
                    east: "atrium",
                    south: "courtyard"
                }, [
                    new NonPlayerCharacter("npc-mechanic", "Gearwright Tamsin", "workshop")
                ]),
                new Room("observatory", "Observatory", "A domed observatory with rotating lenses and a sky-map projector.", { south: "lounge" }, [
                    new NonPlayerCharacter("npc-starwatcher", "Starwatcher Orin", "observatory")
                ]),
                new Room("courtyard", "Courtyard", "An open courtyard with bioluminescent planters and soft mist.", { north: "workshop" }, [
                    new NonPlayerCharacter("npc-gardener", "Gardener Rue", "courtyard")
                ])
            ], "atrium")
        ], "starter-zone", "atrium");
        this._userCommandHandler = userCommandHandler ? userCommandHandler : new UserCommandHandler(this._world);
    }

    private configureSocketServer(): void {
        if (!this._socketServer) {
            return;
        }

        this._socketServer.on("connection", (socket) => {
            const playerName = `Player-${socket.id.slice(0, 4)}`;
            const joinResult = this._world.addPlayer(socket.id, playerName);

            socket.join(joinResult.roomId);
            socket.emit("world:room", joinResult.roomSnapshot);
            socket.emit("world:system", `Welcome, ${playerName}.`);
            socket.to(joinResult.roomId).emit("world:system", joinResult.systemMessage);

            socket.on("disconnect", () => {
                const removedPlayer = this._world.removePlayer(socket.id);
                if (removedPlayer) {
                    socket.to(removedPlayer.roomId).emit("world:system", `${removedPlayer.playerName} has left the room.`);
                }
            });

            socket.on("submit", (command) => {
                console.log(`[INFO] Received command: ${command}`);
                this._userCommandHandler.handleCommand(socket, command);
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
        });

        return this._httpServer;
    }

}
