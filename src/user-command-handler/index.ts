import { type ChatMessage, type GameSocket, type MoveCommand, type RoomSnapshot, type SocketServer } from "../types";
import { World } from "../world";

export class UserCommandHandler {

    private _allowedDirections: string[];
    private _socketServer?: SocketServer;
    private _world: World;

    constructor(world: World) {
        this._allowedDirections = ["north", "south", "east", "west"];
        this._world = world;
    }

    public get allowedDirections(): string[] {
        return this._allowedDirections;
    }

    public handleCommand(socket: GameSocket, command: string): void {
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
            const trimmedMessage = message.trim();
            const hailMatch = trimmedMessage.match(/^hail\s+(.+)/i);
            if (hailMatch) {
                const targetName = hailMatch[1].trim().toLowerCase();
                const room = this._world.getRoom(chatMessage.roomId);
                if (room) {
                    const matchingNonPlayerCharacter = room.nonPlayerCharacters
                        .find((nonPlayerCharacter) => nonPlayerCharacter.name.toLowerCase() === targetName);
                    const hailResponse = matchingNonPlayerCharacter?.respondToHail();
                    if (matchingNonPlayerCharacter && hailResponse) {
                        const trimmedResponse = hailResponse.trim();
                        const punctuationSuffix = /[.!?]$/.test(trimmedResponse) ? "" : ".";
                        const nonPlayerChatMessage: ChatMessage = {
                            message: `${matchingNonPlayerCharacter.name} says, "${trimmedResponse}${punctuationSuffix}"`,
                            playerId: matchingNonPlayerCharacter.id,
                            playerName: matchingNonPlayerCharacter.name,
                            roomId: chatMessage.roomId
                        };
                        this._socketServer?.to(chatMessage.roomId).emit("world:chat", nonPlayerChatMessage);
                    }
                }
            }
            return;
        }

        if (lowerVerb === "look") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", "Player not found.");
                return;
            }

            const roomSnapshot: RoomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
            socket.emit("world:room", roomSnapshot);
            return;
        }

        if (lowerVerb === "who") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", "Player not found.");
                return;
            }

            const zone = this._world.getRoomSnapshot(player.roomId, player.id).zone;
            const playerNames = this._world.getPlayerNamesForZone(zone.id);
            const listItems = [
                ...playerNames,
                `There are ${playerNames.length} players in ${zone.name}`
            ];
            const listMessage = listItems.join("\n");
            socket.emit("world:system", listMessage);
            return;
        }

        const isMoveVerb = lowerVerb === "move" || lowerVerb === "go";
        const isDirectMove = this.allowedDirections.includes(lowerVerb);
        const direction = isMoveVerb ? rest[0] : (isDirectMove ? lowerVerb : "");
        const normalizedDirection = direction ? direction.toLowerCase() : "";

        if (isMoveVerb && direction && !this.allowedDirections.includes(normalizedDirection)) {
            socket.emit("world:system", `${direction} is not a direction, please use 'north', 'south', 'east', or 'west'`);
            return;
        }

        if (normalizedDirection) {
            const moveCommand: MoveCommand = { direction: normalizedDirection };
            const moveResult = this._world.movePlayer(socket.id, moveCommand.direction);
            if ("error" in moveResult) {
                socket.emit("world:system", moveResult.error);
                return;
            }

            socket.leave(moveResult.fromRoomId);
            socket.join(moveResult.toRoomId);

            socket.emit("world:room", moveResult.roomSnapshot);
            socket.emit("world:system", `You move ${moveResult.direction}, you have entered ${moveResult.roomSnapshot.name}`);
            socket.to(moveResult.fromRoomId).emit("world:system", `${moveResult.playerName} leaves to the ${moveResult.direction}.`);
            socket.to(moveResult.toRoomId).emit("world:system", `${moveResult.playerName} arrives from the ${moveResult.direction}.`);
            return;
        }

        socket.emit("world:system", `Unknown command: ${trimmedCommand}`);
    }

    public setSocketServer(socketServer: SocketServer): void {
        this._socketServer = socketServer;
    }

}
