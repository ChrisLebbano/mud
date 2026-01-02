import { type CharacterAttributesSnapshot } from "../types";

export class CharacterAttributes {

    private _health: number;
    private _mana: number;

    constructor(health: number, mana: number) {
        this._health = health;
        this._mana = mana;
    }

    public get health(): number {
        return this._health;
    }

    public get mana(): number {
        return this._mana;
    }

    public toSnapshot(): CharacterAttributesSnapshot {
        return {
            health: this._health,
            mana: this._mana
        };
    }

}

