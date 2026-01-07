import { type NonPlayerCharacterSnapshot, type RoomSnapshot, type ZoneSnapshot } from "../../types";
import { NonPlayerCharacter } from "../non-player-character";

export class Room {

    private _description: string;
    private _exits: Record<string, string>;
    private _id: string;
    private _name: string;
    private _nonPlayerCharacters: Map<string, NonPlayerCharacter>;
    private _players: Set<string>;

    constructor(id: string, name: string, description: string, exits: Record<string, string>, nonPlayerCharacters?: NonPlayerCharacter[]) {
        this._description = description;
        this._exits = exits;
        this._id = id;
        this._name = name;
        this._nonPlayerCharacters = new Map();
        this._players = new Set();

        const initialNonPlayerCharacters = nonPlayerCharacters ? nonPlayerCharacters : [];
        initialNonPlayerCharacters.forEach((nonPlayerCharacter) => {
            nonPlayerCharacter.roomId = this._id;
            this._nonPlayerCharacters.set(nonPlayerCharacter.id, nonPlayerCharacter);
        });
    }

    public addNonPlayerCharacter(nonPlayerCharacter: NonPlayerCharacter): void {
        nonPlayerCharacter.roomId = this._id;
        this._nonPlayerCharacters.set(nonPlayerCharacter.id, nonPlayerCharacter);
    }

    public addPlayer(playerId: string): void {
        this._players.add(playerId);
    }

    public get description(): string {
        return this._description;
    }

    public get exitMap(): Record<string, string> {
        return { ...this._exits };
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get nonPlayerCharacters(): NonPlayerCharacter[] {
        return Array.from(this._nonPlayerCharacters.values());
    }

    public get playerIds(): string[] {
        return Array.from(this._players.values());
    }

    public removeNonPlayerCharacter(nonPlayerCharacterId: string): void {
        this._nonPlayerCharacters.delete(nonPlayerCharacterId);
    }

    public removePlayer(playerId: string): void {
        this._players.delete(playerId);
    }

    public toSnapshot(playerNames: string[], zoneSnapshot: ZoneSnapshot): RoomSnapshot {
        const nonPlayerCharacters: NonPlayerCharacterSnapshot[] = this.nonPlayerCharacters
            .map((nonPlayerCharacter) => ({
                id: nonPlayerCharacter.id,
                name: nonPlayerCharacter.name
            }))
            .sort((left, right) => left.name.localeCompare(right.name));

        return {
            description: this._description,
            exits: Object.keys(this._exits).sort(),
            id: this._id,
            name: this._name,
            nonPlayerCharacters,
            players: [...playerNames].sort(),
            zone: zoneSnapshot
        };
    }

}
