import { Player } from "../player";
import { Room } from "../room";
import { type ChatMessage, type RoomSnapshot } from "../types";
import { Zone } from "../zone";

export class World {

    private _players: Map<string, Player>;
    private _rooms: Map<string, Room>;
    private _startingRoomId: string;
    private _startingZoneId: string;
    private _zones: Map<string, Zone>;
    private _roomZones: Map<string, Zone>;

    constructor(zones: Zone[], startingZoneId: string, startingRoomId: string) {
        this._players = new Map();
        this._rooms = new Map();
        this._startingRoomId = startingRoomId;
        this._startingZoneId = startingZoneId;
        this._zones = new Map(zones.map((zone) => [zone.id, zone]));
        this._roomZones = new Map();

        zones.forEach((zone) => {
            zone.rooms.forEach((room) => {
                if (this._rooms.has(room.id)) {
                    throw new Error(`Duplicate room id detected: ${room.id}`);
                }
                this._rooms.set(room.id, room);
                this._roomZones.set(room.id, zone);
            });
        });

        const startingZone = this.getZoneById(this._startingZoneId);
        const startingRoom = startingZone.getRoom(this._startingRoomId);
        if (!startingRoom) {
            throw new Error(`Room not found: ${this._startingRoomId}`);
        }
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
        const zone = this.getZoneForRoom(roomId);
        const playerNames = room.playerIds.map((playerId) => {
            const player = this._players.get(playerId);
            return player ? player.name : playerId;
        });

        return room.toSnapshot(playerNames, zone.toSnapshot());
    }

    public getZone(zoneId: string): Zone | undefined {
        return this._zones.get(zoneId);
    }

    private getZoneById(zoneId: string): Zone {
        const zone = this._zones.get(zoneId);
        if (!zone) {
            throw new Error(`Zone not found: ${zoneId}`);
        }
        return zone;
    }

    private getZoneForRoom(roomId: string): Zone {
        const zone = this._roomZones.get(roomId);
        if (!zone) {
            throw new Error(`Zone not found for room: ${roomId}`);
        }
        return zone;
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

        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            return { error: "What would you like to say? (say [message here])" };
        }

        return {
            chatMessage: {
                message: `${player.name} says, "${trimmedMessage}".`,
                playerId: player.id,
                playerName: player.name,
                roomId: player.roomId
            }
        };
    }

}
