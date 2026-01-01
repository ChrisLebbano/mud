import { Player } from "../player";
import { Room } from "../room";
import { type ChatMessage, type RoomSnapshot } from "../types";

export class World {

    private _players: Map<string, Player>;
    private _rooms: Map<string, Room>;
    private _startingRoomId: string;

    constructor(rooms: Room[], startingRoomId: string) {
        this._players = new Map();
        this._rooms = new Map(rooms.map((room) => [room.id, room]));
        this._startingRoomId = startingRoomId;
    }

    public addPlayer(playerId: string, playerName: string) {
        const room = this.getRoomById(this._startingRoomId);
        const player = new Player(playerId, playerName, room.id);

        this._players.set(playerId, player);
        room.addPlayer(playerId);

        return {
            roomId: room.id,
            roomSnapshot: this.getRoomSnapshot(room.id),
            systemMessage: `${playerName} has entered the room.`
        };
    }

    public getPlayer(playerId: string): Player | undefined {
        return this._players.get(playerId);
    }

    public getRoom(roomId: string): Room | undefined {
        return this._rooms.get(roomId);
    }

    private getRoomById(roomId: string): Room {
        const room = this._rooms.get(roomId);
        if (!room) {
            throw new Error(`Room not found: ${roomId}`);
        }
        return room;
    }

    public getRoomSnapshot(roomId: string): RoomSnapshot {
        const room = this.getRoomById(roomId);
        const playerNames = room.playerIds.map((playerId) => {
            const player = this._players.get(playerId);
            return player ? player.name : playerId;
        });

        return room.toSnapshot(playerNames);
    }

    public movePlayer(playerId: string, direction: string) {
        const player = this._players.get(playerId);
        if (!player) {
            return { error: "Player not found." };
        }

        const currentRoom = this.getRoomById(player.roomId);
        const exitRoomId = currentRoom.exitMap[direction];

        if (!exitRoomId) {
            return { error: `No exit to the ${direction}.` };
        }

        const nextRoom = this.getRoomById(exitRoomId);

        currentRoom.removePlayer(playerId);
        nextRoom.addPlayer(playerId);
        player.roomId = nextRoom.id;

        return {
            direction,
            fromRoomId: currentRoom.id,
            playerName: player.name,
            roomSnapshot: this.getRoomSnapshot(nextRoom.id),
            toRoomId: nextRoom.id
        };
    }

    public removePlayer(playerId: string) {
        const player = this._players.get(playerId);
        if (!player) {
            return;
        }

        const room = this.getRoomById(player.roomId);
        room.removePlayer(playerId);
        this._players.delete(playerId);

        return { playerName: player.name, roomId: room.id };
    }

    public say(playerId: string, message: string) {
        const player = this._players.get(playerId);
        if (!player) {
            return { error: "Player not found." };
        }

        if (!message.trim()) {
            return { error: "Say what?" };
        }

        return {
            chatMessage: {
                message,
                playerId: player.id,
                playerName: player.name,
                roomId: player.roomId
            }
        };
    }

}
