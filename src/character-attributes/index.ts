import { type CharacterAttributesSnapshot, type CharacterAttributeValues } from "../types";

export class CharacterAttributes {

    // Agility: "Modifies success for various skills (dodge, block, parry, etc)."
    private _agility: number;
    // Charisma: Affects how much non player characters will like you, as well as how successful mind-altering spells are.
    private _charisma: number;
    // Constitution: "Modifies base health."
    private _constitution: number;
    // Dexterity: "Modifies attack accuracy"
    private _dexterity: number;
    // Health: Maximum base health
    private _health: number;
    // Intelligence: "Increases damage done and healing done by spells.  Increases duration for damage over time, and healing over time."
    private _intelligence: number;
    // Mana: Maximum base Mana. Expend to cast spells.
    private _mana: number;
    // Perception: "Modifies the character's ability to interrupt a target during melee."
    private _perception: number;
    // Resolve: "Higher resolve reduces the chance a character will be interrupted, and lower the chance a spell will fizzle. A high resolve will have a small chance to help resist a spell outright, as opposed to reducing the magical damage."
    private _resolve: number;
    // Strength: "Modifies attack power, and determines how much weight they can carry. Sometimes is used to check if a character can move an object"
    private _strength: number;
    // Wisdom: "Modifies total Mana."
    private _wisdom: number;

    constructor(baseAttributes: CharacterAttributeValues, attributeModifiers: CharacterAttributeValues) {
        this._agility = baseAttributes.agility + attributeModifiers.agility;
        this._charisma = baseAttributes.charisma + attributeModifiers.charisma;
        this._constitution = baseAttributes.constitution + attributeModifiers.constitution;
        this._dexterity = baseAttributes.dexterity + attributeModifiers.dexterity;
        this._health = baseAttributes.health + attributeModifiers.health;
        this._intelligence = baseAttributes.intelligence + attributeModifiers.intelligence;
        this._mana = baseAttributes.mana + attributeModifiers.mana;
        this._perception = baseAttributes.perception + attributeModifiers.perception;
        this._resolve = baseAttributes.resolve + attributeModifiers.resolve;
        this._strength = baseAttributes.strength + attributeModifiers.strength;
        this._wisdom = baseAttributes.wisdom + attributeModifiers.wisdom;
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
