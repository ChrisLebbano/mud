import { Character } from "../character";
import { CharacterSecondaryAttributes } from "../character-secondary-attributes";
import { Race } from "../race";

export class NonPlayerCharacter extends Character {

    private _hailResponse?: string;

    constructor(id: string, name: string, roomId: string, race: Race, hailResponse?: string, maxHealth?: number) {
        const resolvedMaxHealth = maxHealth ?? 40;
        const secondaryAttributes = new CharacterSecondaryAttributes(resolvedMaxHealth, 5, 5);
        super(id, name, roomId, race, secondaryAttributes);
        this._hailResponse = hailResponse;
    }

    public get hailResponse(): string | undefined {
        return this._hailResponse;
    }

    public respondToHail(): string | undefined {
        return this._hailResponse;
    }

}
