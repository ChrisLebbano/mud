import { type RoomSnapshot, type ZoneSnapshot } from "../types";

export class Room {

    private _description: string;
    private _exits: Record<string, string>;
    private _id: string;
    private _name: string;
    private _players: Set<string>;

    constructor(id: string, name: string, description: string, exits: Record<string, string>) {
        this._description = description;
        this._exits = exits;
        this._id = id;
        this._name = name;
        this._players = new Set();
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

    public get playerIds(): string[] {
        return Array.from(this._players.values());
    }

    public removePlayer(playerId: string): void {
        this._players.delete(playerId);
    }

    public toSnapshot(playerNames: string[], zoneSnapshot: ZoneSnapshot): RoomSnapshot {
        return {
            description: this._description,
            exits: Object.keys(this._exits).sort(),
            id: this._id,
            name: this._name,
            players: [...playerNames].sort(),
            zone: zoneSnapshot
        };
    }

}

