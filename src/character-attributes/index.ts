import { type CharacterAttributesSnapshot } from "../types";

export class CharacterAttributes {

    // Agility: "Modifies damage mitigation success for various skills (dodge, block, parry, etc)."
    private _agility: number;
    private _charisma: number;
    // Constitution: "Modifies base health."
    private _constitution: number;
    // Dexterity: "Modifies attack speed"
    private _dexterity: number;
    private _health: number;
    // Intelligence: "Increases damage done and healing done by spells.  Increases duration for damage over time, and healing over time."
    private _intelligence: number;
    private _mana: number;
    // Perception: "Modifies the character's ability to interrupt a target during melee."
    private _perception: number;
    // Resolve: "Higher resolve reduces the chance a character will be interrupted, and lower the chance a spell will fizzle. A high resolve will have a small chance to help resist a spell outright, as opposed to reducing the magical damage."
    private _resolve: number;
    // Strength: "Modifies attack power, and determines how much weight they can carry. Sometimes is used to check if a character can move an object"
    private _strength: number;
    // Wisdom: "Modifies total Mana."
    private _wisdom: number;

    constructor(health: number, mana: number) {
        this._agility = 10;
        this._charisma = 10;
        this._constitution = 10;
        this._dexterity = 10;
        this._health = health;
        this._intelligence = 10;
        this._mana = mana;
        this._perception = 10;
        this._resolve = 10;
        this._strength = 10;
        this._wisdom = 10;
    }

    public get agility(): number {
        return this._agility;
    }

    public get charisma(): number {
        return this._charisma;
    }

    public get constitution(): number {
        return this._constitution;
    }

    public get dexterity(): number {
        return this._dexterity;
    }

    public get health(): number {
        return this._health;
    }

    public get intelligence(): number {
        return this._intelligence;
    }

    public get mana(): number {
        return this._mana;
    }

    public get perception(): number {
        return this._perception;
    }

    public get resolve(): number {
        return this._resolve;
    }

    public get strength(): number {
        return this._strength;
    }

    public toSnapshot(): CharacterAttributesSnapshot {
        return {
            agility: this._agility,
            charisma: this._charisma,
            constitution: this._constitution,
            dexterity: this._dexterity,
            health: this._health,
            intelligence: this._intelligence,
            mana: this._mana,
            perception: this._perception,
            resolve: this._resolve,
            strength: this._strength,
            wisdom: this._wisdom
        };
    }

    public get wisdom(): number {
        return this._wisdom;
    }

}
