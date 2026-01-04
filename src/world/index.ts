import { Character } from "../character";
import { NonPlayerCharacter } from "../non-player-character";
import { PlayerCharacter } from "../player-character";
import { Room } from "../room";
import { type ChatMessage, type RoomSnapshot, type WorldData } from "../types";
import { Zone } from "../zone";

export class World {

    private _players: Map<string, PlayerCharacter>;
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
        const player = new PlayerCharacter(playerId, playerName, room.id);

        this._players.set(playerId, player);
        room.addPlayer(playerId);

        return {
            roomId: room.id,
            roomSnapshot: this.getRoomSnapshot(room.id, playerId),
            systemMessage: `${playerName} has entered the room.`
        };
    }

    private clearTargetsOutsideRoom(): void {
        this._players.forEach((player) => {
            const target = player.primaryTarget;
            if (!target) {
                return;
            }

            if (player.roomId !== target.roomId) {
                player.isAttacking = false;
                player.primaryTarget = undefined;
            }
        });
    }

    public static fromData(worldData: WorldData): World {
        const zones = worldData.zones.map((zoneData) => {
            const rooms = zoneData.rooms.map((roomData) => {
                const nonPlayerCharacters = (roomData.nonPlayerCharacters ?? []).map((nonPlayerCharacterData) => new NonPlayerCharacter(
                    nonPlayerCharacterData.id,
                    nonPlayerCharacterData.name,
                    roomData.id,
                    nonPlayerCharacterData.hailResponse
                ));

                return new Room(
                    roomData.id,
                    roomData.name,
                    roomData.description,
                    roomData.exits,
                    nonPlayerCharacters
                );
            });

            return new Zone(zoneData.id, zoneData.name, rooms, zoneData.startingRoomId);
        });

        return new World(zones, worldData.startingZoneId, worldData.startingRoomId);
    }

    public getPlayer(playerId: string): PlayerCharacter | undefined {
        return this._players.get(playerId);
    }

    public getPlayerNamesForZone(zoneId: string): string[] {
        return Array.from(this._players.values())
            .filter((player) => this.getZoneForRoom(player.roomId).id === zoneId)
            .map((player) => player.name);
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

    public getRoomSnapshot(roomId: string, playerId?: string): RoomSnapshot {
        const room = this.getRoomById(roomId);
        const zone = this.getZoneForRoom(roomId);
        const playerNames = room.playerIds.map((listedPlayerId) => {
            const player = this._players.get(listedPlayerId);
            return player ? player.name : listedPlayerId;
        });

        const roomSnapshot = room.toSnapshot(playerNames, zone.toSnapshot());
        if (playerId) {
            const player = this._players.get(playerId);
            if (player) {
                roomSnapshot.player = player.toSnapshot();
            }
        }

        return roomSnapshot;
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
        this.clearTargetsOutsideRoom();

        return {
            direction,
            fromRoomId: currentRoom.id,
            playerName: player.name,
            roomSnapshot: this.getRoomSnapshot(nextRoom.id, playerId),
            toRoomId: nextRoom.id
        };
    }

    public performAttack(playerId: string) {
        const player = this._players.get(playerId);
        if (!player) {
            return { error: "Player not found." };
        }

        const target = player.primaryTarget;
        if (!target) {
            return { error: "No primary target selected." };
        }

        if (target.roomId !== player.roomId) {
            player.isAttacking = false;
            player.primaryTarget = undefined;
            return { error: `${target.name} is no longer here.` };
        }

        if (!target.secondaryAttributes.isAlive) {
            player.isAttacking = false;
            return { warning: `Cannot attack ${target.name}. ${target.name} is already dead.` };
        }

        const damage = player.secondaryAttributes.attackDamage;
        const remainingHealth = target.secondaryAttributes.applyDamage(damage);
        const targetPlayerId = target instanceof PlayerCharacter ? target.id : undefined;

        if (remainingHealth <= 0) {
            player.isAttacking = false;
            return {
                attackerName: player.name,
                damage,
                targetPlayerId,
                targetCurrentHealth: remainingHealth,
                targetName: target.name,
                warning: `You have slain ${target.name}.`,
                stopMessage: "You stop attacking."
            };
        }

        return {
            attackerName: player.name,
            damage,
            targetPlayerId,
            targetCurrentHealth: remainingHealth,
            targetName: target.name
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

    public say(playerId: string, message: string): { chatMessage: ChatMessage } | { error: string } {
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
                category: "CharacterSpeech",
                message: `${player.name} says, "${trimmedMessage}".`,
                playerId: player.id,
                playerName: player.name,
                roomId: player.roomId
            }
        };
    }

    public setPrimaryTarget(playerId: string, targetName: string) {
        const player = this._players.get(playerId);
        if (!player) {
            return { error: "Player not found." };
        }

        const trimmedTargetName = targetName.trim();
        if (!trimmedTargetName) {
            return { error: "Target who?" };
        }

        const normalizedTargetName = trimmedTargetName.toLowerCase();
        const room = this.getRoomById(player.roomId);
        const matchingPlayer = room.playerIds
            .filter((listedPlayerId) => listedPlayerId !== playerId)
            .map((listedPlayerId) => this._players.get(listedPlayerId))
            .find((listedPlayer) => listedPlayer && listedPlayer.name.toLowerCase() === normalizedTargetName);
        const matchingNonPlayerCharacter = room.nonPlayerCharacters
            .find((nonPlayerCharacter) => nonPlayerCharacter.name.toLowerCase() === normalizedTargetName);
        const target: Character | undefined = matchingPlayer ?? matchingNonPlayerCharacter;

        if (!target) {
            return { error: `No target found named ${trimmedTargetName}.` };
        }

        player.primaryTarget = target;

        return {
            roomSnapshot: this.getRoomSnapshot(player.roomId, playerId),
            targetName: target.name
        };
    }

}
