import { Character } from "../character";
import { CharacterSecondaryAttributes } from "../character-secondary-attributes";

export class NonPlayerCharacter extends Character {

    private _hailResponse?: string;

    constructor(id: string, name: string, roomId: string, hailResponse?: string, maxHealth?: number) {
        const resolvedMaxHealth = maxHealth ?? 40;
        const secondaryAttributes = new CharacterSecondaryAttributes(resolvedMaxHealth, 5, 5);
        super(id, name, roomId, secondaryAttributes);
        this._hailResponse = hailResponse;
    }

    public get hailResponse(): string | undefined {
        return this._hailResponse;
    }

    public respondToHail(): string | undefined {
        return this._hailResponse;
    }

}

