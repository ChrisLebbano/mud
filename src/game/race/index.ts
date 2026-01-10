import { type CharacterAttributeValues } from "../types/character-attributes";
import { type RaceSnapshot } from "../types/race";

export class Race {

    private _baseAttributes: CharacterAttributeValues;
    private _baseHealth: number;
    private _description: string;
    private _id: string;
    private _name: string;

    constructor(id: string, name: string, description: string, baseAttributes: CharacterAttributeValues, baseHealth: number) {
        this._baseAttributes = baseAttributes;
        this._baseHealth = baseHealth;
        this._description = description;
        this._id = id;
        this._name = name;
    }

    public get baseAttributes(): CharacterAttributeValues {
        return this._baseAttributes;
    }

    public get baseHealth(): number {
        return this._baseHealth;
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

