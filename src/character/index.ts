export class Character {

    private _id: string;
    private _name: string;
    private _roomId: string;

    constructor(id: string, name: string, roomId: string) {
        this._id = id;
        this._name = name;
        this._roomId = roomId;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public set roomId(roomId: string) {
        this._roomId = roomId;
    }

}

