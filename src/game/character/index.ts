import { CharacterAttributes } from "../character-attributes";
import { CharacterClass } from "../character-class";
import { CharacterSecondaryAttributes } from "../character-secondary-attributes";
import { Inventory } from "../inventory";
import { Race } from "../race";

export class Character {

    private _attributes: CharacterAttributes;
    private _characterClass: CharacterClass;
    private _id: string;
    private _inventory: Inventory;
    private _isAttacking: boolean;
    private _level: number;
    private _name: string;
    private _primaryTarget?: Character;
    private _race: Race;
    private _roomId: string;
    private _secondaryAttributes: CharacterSecondaryAttributes;

    constructor(id: string, name: string, roomId: string, race: Race, characterClass: CharacterClass, secondaryAttributes?: CharacterSecondaryAttributes) {
        this._attributes = new CharacterAttributes(race.baseAttributes, characterClass.attributeModifiers);
        this._characterClass = characterClass;
        this._id = id;
        this._inventory = new Inventory();
        this._isAttacking = false;
        this._level = 1;
        this._name = name;
        this._roomId = roomId;
        this._race = race;
        this._secondaryAttributes = secondaryAttributes ?? new CharacterSecondaryAttributes(0);
        this.recalculateMaxHealth(true);
    }

    public get attributes(): CharacterAttributes {
        return this._attributes;
    }

    private calculateMaxHealthValue(): number {
        const baseHealth = this._race.baseHealth + this._characterClass.baseHealth;
        const constitutionHealth = this._attributes.constitution * 2;
        return Math.floor((this._level * 0.75) * (baseHealth + constitutionHealth));
    }

    public get characterClass(): CharacterClass {
        return this._characterClass;
    }

    public get id(): string {
        return this._id;
    }

    public get inventory(): Inventory {
        return this._inventory;
    }

    public get isAttacking(): boolean {
        return this._isAttacking;
    }

    public set isAttacking(isAttacking: boolean) {
        this._isAttacking = isAttacking;
    }

    public get level(): number {
        return this._level;
    }

    public set level(level: number) {
        this._level = level;
        this.recalculateMaxHealth(false);
    }

    public get name(): string {
        return this._name;
    }

    public get primaryTarget(): Character | undefined {
        return this._primaryTarget;
    }

    public set primaryTarget(primaryTarget: Character | undefined) {
        this._primaryTarget = primaryTarget;
    }

    public get race(): Race {
        return this._race;
    }

    public recalculateMaxHealth(shouldResetCurrentHealth: boolean): number {
        const maxHealth = this.calculateMaxHealthValue();
        this._secondaryAttributes.setMaxHealth(maxHealth, shouldResetCurrentHealth);
        return maxHealth;
    }

    public get roomId(): string {
        return this._roomId;
    }

    public set roomId(roomId: string) {
        this._roomId = roomId;
    }

    public get secondaryAttributes(): CharacterSecondaryAttributes {
        return this._secondaryAttributes;
    }

}

