import { Room } from "../room";
import { type ZoneSnapshot } from "../types";

export class Zone {

    private _id: string;
    private _name: string;
    private _rooms: Map<string, Room>;
    private _startingRoomId: string;

    constructor(id: string, name: string, rooms: Room[], startingRoomId: string) {
        this._id = id;
        this._name = name;
        this._rooms = new Map(rooms.map((room) => [room.id, room]));
        this._startingRoomId = startingRoomId;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public getRoom(roomId: string): Room | undefined {
        return this._rooms.get(roomId);
    }

    public get rooms(): Room[] {
        return Array.from(this._rooms.values());
    }

    public get startingRoomId(): string {
        return this._startingRoomId;
    }

    public toSnapshot(): ZoneSnapshot {
        return {
            id: this._id,
            name: this._name
        };
    }

}

