import { Character } from "../character";
import { CharacterClass } from "../character-class";
import { Item } from "../item";
import { NonPlayerCharacter } from "../non-player-character";
import { PlayerCharacter } from "../player-character";
import { Race } from "../race";
import { Room } from "../room";
import { type ChatMessage } from "../types/message";
import { type RoomSnapshot } from "../types/room";
import { type WorldClassData, type WorldData, type WorldItemData, type WorldNonPlayerCharacterData, type WorldRaceData } from "../types/world-data";
import { Zone } from "../zone";

export class World {

    private _classes: Map<string, CharacterClass>;
    private _classesByName: Map<string, CharacterClass>;
    private _items: Item[];
    private _players: Map<string, PlayerCharacter>;
    private _races: Map<string, Race>;
    private _racesByName: Map<string, Race>;
    private _rooms: Map<string, Room>;
    private _roomZones: Map<string, Zone>;
    private _startingRoomId: string;
    private _startingZoneId: string;
    private _zones: Map<string, Zone>;

    constructor(zones: Zone[], races: Race[], classes: CharacterClass[], startingZoneId: string, startingRoomId: string, items?: Item[]) {
        this._classes = new Map(classes.map((characterClass) => [characterClass.id, characterClass]));
        this._classesByName = new Map(classes.map((characterClass) => [characterClass.name.toLowerCase(), characterClass]));
        this._items = items ?? [];
        this._players = new Map();
        this._races = new Map(races.map((race) => [race.id, race]));
        this._racesByName = new Map(races.map((race) => [race.name.toLowerCase(), race]));
        this._rooms = new Map();
        this._roomZones = new Map();
        this._startingRoomId = startingRoomId;
        this._startingZoneId = startingZoneId;
        this._zones = new Map(zones.map((zone) => [zone.id, zone]));

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

    public addPlayer(playerId: string, playerName: string, playerRaceName: string, playerClassName: string) {
        const room = this.getRoomById(this._startingRoomId);
        const playerRace = this.getRaceByName(playerRaceName);
        const playerClass = this.getClassByName(playerClassName);
        const player = new PlayerCharacter(playerId, playerName, room.id, playerRace, playerClass);
        const breadItem = this._items.find((item) => item.name === "bread");
        const waterFlaskItem = this._items.find((item) => item.name === "water flask");

        if (breadItem) {
            player.inventory.addItem(breadItem, 5);
        }

        if (waterFlaskItem) {
            player.inventory.addItem(waterFlaskItem, 5);
        }

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

    public static fromData(worldData: WorldData, raceData: WorldRaceData[], classData: WorldClassData[], itemData?: WorldItemData[], nonPlayerCharacterData?: WorldNonPlayerCharacterData[]): World {
        const classes = classData.map((classEntry) => new CharacterClass(
            classEntry.id,
            classEntry.name,
            classEntry.description,
            classEntry.attributeModifiers
        ));
        const classMap = new Map(classes.map((characterClass) => [characterClass.id, characterClass]));
        const races = raceData.map((raceEntry) => new Race(
            raceEntry.id,
            raceEntry.name,
            raceEntry.description,
            raceEntry.baseAttributes
        ));
        const raceMap = new Map(races.map((race) => [race.id, race]));
        const items = (itemData ?? []).map((itemEntry) => new Item(
            itemEntry.name,
            itemEntry.description,
            itemEntry.type,
            itemEntry.maxCount
        ));
        const nonPlayerCharactersByRoom = new Map<string, WorldNonPlayerCharacterData[]>();
        (nonPlayerCharacterData ?? []).forEach((nonPlayerCharacter) => {
            const entries = nonPlayerCharactersByRoom.get(nonPlayerCharacter.roomId) ?? [];
            entries.push(nonPlayerCharacter);
            nonPlayerCharactersByRoom.set(nonPlayerCharacter.roomId, entries);
        });
        const zones = worldData.zones.map((zoneData) => {
            const rooms = zoneData.rooms.map((roomData) => {
                const nonPlayerCharacters = (nonPlayerCharactersByRoom.get(roomData.id) ?? []).map((nonPlayerCharacter) => new NonPlayerCharacter(
                    nonPlayerCharacter.id,
                    nonPlayerCharacter.name,
                    roomData.id,
                    World.getRaceFromMap(raceMap, nonPlayerCharacter.raceId),
                    World.getClassFromMap(classMap, nonPlayerCharacter.classId),
                    nonPlayerCharacter.hailResponse,
                    nonPlayerCharacter.maxHealth
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

        return new World(zones, races, classes, worldData.startingZoneId, worldData.startingRoomId, items);
    }

    private getClassByName(className: string): CharacterClass {
        const normalizedName = className.trim().toLowerCase();
        const characterClass = this._classesByName.get(normalizedName);
        if (!characterClass) {
            throw new Error(`Class not found: ${className}`);
        }
        return characterClass;
    }

    private static getClassFromMap(classMap: Map<string, CharacterClass>, classId: string): CharacterClass {
        const characterClass = classMap.get(classId);
        if (!characterClass) {
            throw new Error(`Class not found: ${classId}`);
        }
        return characterClass;
    }

    public getPlayer(playerId: string): PlayerCharacter | undefined {
        return this._players.get(playerId);
    }

    public getPlayerNamesForZone(zoneId: string): string[] {
        return Array.from(this._players.values())
            .filter((player) => this.getZoneForRoom(player.roomId).id === zoneId)
            .map((player) => player.name);
    }

    private getRaceByName(raceName: string): Race {
        const normalizedName = raceName.trim().toLowerCase();
        const race = this._racesByName.get(normalizedName);
        if (!race) {
            throw new Error(`Race not found: ${raceName}`);
        }
        return race;
    }

    private static getRaceFromMap(raceMap: Map<string, Race>, raceId: string): Race {
        const race = raceMap.get(raceId);
        if (!race) {
            throw new Error(`Race not found: ${raceId}`);
        }
        return race;
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

    public get items(): Item[] {
        return this._items;
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

    public performNonPlayerCharacterAttack(nonPlayerCharacterId: string, targetPlayerId: string) {
        const targetPlayer = this._players.get(targetPlayerId);
        if (!targetPlayer) {
            return { error: "Player not found." };
        }

        let attacker: NonPlayerCharacter | undefined;
        this._rooms.forEach((room) => {
            if (attacker) {
                return;
            }

            const matchingNonPlayerCharacter = room.nonPlayerCharacters
                .find((nonPlayerCharacter) => nonPlayerCharacter.id === nonPlayerCharacterId);
            if (matchingNonPlayerCharacter) {
                attacker = matchingNonPlayerCharacter;
            }
        });

        if (!attacker) {
            return { error: "Non-player character not found." };
        }

        if (attacker.roomId !== targetPlayer.roomId) {
            attacker.isAttacking = false;
            attacker.primaryTarget = undefined;
            return { error: `${attacker.name} is no longer here.` };
        }

        if (!attacker.secondaryAttributes.isAlive) {
            attacker.isAttacking = false;
            return { warning: `${attacker.name} is already dead.` };
        }

        if (!targetPlayer.secondaryAttributes.isAlive) {
            attacker.isAttacking = false;
            return { warning: `${targetPlayer.name} is already dead.` };
        }

        const damage = attacker.secondaryAttributes.attackDamage;
        const remainingHealth = targetPlayer.secondaryAttributes.applyDamage(damage);

        if (remainingHealth <= 0) {
            attacker.isAttacking = false;
            return {
                attackerName: attacker.name,
                damage,
                stopMessage: "You stop attacking.",
                targetCurrentHealth: remainingHealth,
                warning: `You have been slain by ${attacker.name}.`
            };
        }

        return {
            attackerName: attacker.name,
            damage,
            targetCurrentHealth: remainingHealth
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

    public shout(playerId: string, message: string): { chatMessage: ChatMessage; roomIds: string[]; selfMessage: ChatMessage } | { error: string } {
        const player = this._players.get(playerId);
        if (!player) {
            return { error: "Player not found." };
        }

        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            return { error: "What would you like to shout? (shout [message here])" };
        }

        const zone = this.getZoneForRoom(player.roomId);
        return {
            chatMessage: {
                category: "Shout",
                message: `${player.name} shouts "${trimmedMessage}".`,
                playerId: player.id,
                playerName: player.name,
                roomId: player.roomId
            },
            roomIds: zone.rooms.map((room) => room.id),
            selfMessage: {
                category: "Shout",
                message: `You shout "${trimmedMessage}".`,
                playerId: player.id,
                playerName: player.name,
                roomId: player.roomId
            }
        };
    }

}

