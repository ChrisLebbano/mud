import { type RaceSnapshot } from "../types";

export class Race {

    private _description: string;
    private _id: string;
    private _name: string;

    constructor(id: string, name: string, description: string) {
        this._description = description;
        this._id = id;
        this._name = name;
    }

    public get description(): string {
        return this._description;
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public toSnapshot(): RaceSnapshot {
        return {
            description: this._description,
            id: this._id,
            name: this._name
        };
    }

}

