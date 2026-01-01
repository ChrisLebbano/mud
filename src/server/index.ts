import { NodeHttpServerFactory } from "../node-http-server-factory";
import { Room } from "../room";
import { ServerRouter } from "../server-router";
import { SocketServerFactory } from "../socket-server-factory";
import { type ChatMessage, type GameSocket, type MoveCommand, type NodeHttpServer, type RoomSnapshot, type ServerConfig, type SocketServer } from "../types";
import { World } from "../world";

export class Server {

    private _httpServer?: NodeHttpServer;
    private _serverConfig: ServerConfig;
    private _serverRouter: ServerRouter;
    private _socketServer?: SocketServer;
    private _world: World;

    constructor(serverConfig: ServerConfig, serverRouter: ServerRouter, world?: World) {
        this._serverConfig = serverConfig;
        this._serverRouter = serverRouter;
        this._world = world ? world : new World([
            new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }),
            new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", { south: "atrium" })
        ], "atrium");
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
                this.handleCommand(socket, command);
            });
        });
    }

    private handleCommand(socket: GameSocket, command: string): void {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            return;
        }

        const [verb, ...rest] = trimmedCommand.split(" ");
        const lowerVerb = verb.toLowerCase();

        if (lowerVerb === "say") {
            const message = rest.join(" ");
            const sayResult = this._world.say(socket.id, message);
            if ("error" in sayResult) {
                socket.emit("world:system", sayResult.error);
                return;
            }

            const chatMessage: ChatMessage = sayResult.chatMessage;
            this._socketServer?.to(chatMessage.roomId).emit("world:chat", chatMessage);
            return;
        }

        if (lowerVerb === "look") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", "Player not found.");
                return;
            }

            const roomSnapshot: RoomSnapshot = this._world.getRoomSnapshot(player.roomId);
            socket.emit("world:room", roomSnapshot);
            return;
        }

        const isMoveVerb = lowerVerb === "move" || lowerVerb === "go";
        const isDirectMove = ["north", "south", "east", "west"].includes(lowerVerb);
        const direction = isMoveVerb ? rest[0] : (isDirectMove ? lowerVerb : "");

        if (direction) {
            const moveCommand: MoveCommand = { direction };
            const moveResult = this._world.movePlayer(socket.id, moveCommand.direction);
            if ("error" in moveResult) {
                socket.emit("world:system", moveResult.error);
                return;
            }

            socket.leave(moveResult.fromRoomId);
            socket.join(moveResult.toRoomId);

            socket.emit("world:room", moveResult.roomSnapshot);
            socket.to(moveResult.fromRoomId).emit("world:system", `${moveResult.playerName} leaves to the ${moveResult.direction}.`);
            socket.to(moveResult.toRoomId).emit("world:system", `${moveResult.playerName} arrives from the ${moveResult.direction}.`);
            return;
        }

        socket.emit("world:system", `Unknown command: ${trimmedCommand}`);
    }

    public start(): NodeHttpServer {
        this._httpServer = NodeHttpServerFactory.createServer((request, response) => {
            this._serverRouter.handle(request, response);
        });

        this._httpServer.on("listening", () => {
            this._socketServer = SocketServerFactory.createSocketIOServer(this._httpServer as NodeHttpServer);
            this.configureSocketServer();
            console.log(`[INFO] Socket Server started`);
        });

        this._httpServer.listen(this._serverConfig.port, () => {
            console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
        });

        return this._httpServer;
    }

}
