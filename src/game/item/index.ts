import { ITEM_TYPE } from "../types/item-type";

export class Item {

    private static _nextId = 1;

    private _description: string;
    private _id: number;
    private _maxCount: number;
    private _name: string;
    private _type: ITEM_TYPE;

    constructor(name: string, description: string, type: ITEM_TYPE, maxCount?: number) {
        this._description = description;
        this._id = Item._nextId;
        this._maxCount = maxCount ?? 1;
        this._name = name;
        this._type = type;
        Item._nextId += 1;
    }

    public get description(): string {
        return this._description;
    }

    public get id(): number {
        return this._id;
    }

    public get maxCount(): number {
        return this._maxCount;
    }

    public get name(): string {
        return this._name;
    }

    public get type(): ITEM_TYPE {
        return this._type;
    }

}
