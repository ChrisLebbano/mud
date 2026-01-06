import { type CharacterAttributeValues, type CharacterClassSnapshot } from "../types";

export class CharacterClass {

    private _attributeModifiers: CharacterAttributeValues;
    private _description: string;
    private _id: string;
    private _name: string;

    constructor(id: string, name: string, description: string, attributeModifiers: CharacterAttributeValues) {
        this._attributeModifiers = attributeModifiers;
        this._description = description;
        this._id = id;
        this._name = name;
    }

    public get attributeModifiers(): CharacterAttributeValues {
        return this._attributeModifiers;
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

    public toSnapshot(): CharacterClassSnapshot {
        return {
            description: this._description,
            id: this._id,
            name: this._name
        };
    }

}
