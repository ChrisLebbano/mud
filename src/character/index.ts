import { CharacterAttributes } from "../character-attributes";
import { CharacterSecondaryAttributes } from "../character-secondary-attributes";
import { Race } from "../race";

export class Character {

    private _attributes: CharacterAttributes;
    private _id: string;
    private _isAttacking: boolean;
    private _level: number;
    private _name: string;
    private _primaryTarget?: Character;
    private _race: Race;
    private _roomId: string;
    private _secondaryAttributes: CharacterSecondaryAttributes;

    constructor(id: string, name: string, roomId: string, race: Race, secondaryAttributes?: CharacterSecondaryAttributes) {
        this._attributes = new CharacterAttributes(40, 20);
        this._id = id;
        this._isAttacking = false;
        this._level = 1;
        this._name = name;
        this._roomId = roomId;
        this._race = race;
        this._secondaryAttributes = secondaryAttributes ?? new CharacterSecondaryAttributes(this._attributes.health);
    }

    public get attributes(): CharacterAttributes {
        return this._attributes;
    }

    public get id(): string {
        return this._id;
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
