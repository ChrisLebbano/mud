import { Character } from "../character";

export class NonPlayerCharacter extends Character {

    private _hailResponse?: string;

    constructor(id: string, name: string, roomId: string, hailResponse?: string) {
        super(id, name, roomId);
        this._hailResponse = hailResponse;
    }

    public get hailResponse(): string | undefined {
        return this._hailResponse;
    }

    public respondToHail(): string | undefined {
        return this._hailResponse;
    }

}
