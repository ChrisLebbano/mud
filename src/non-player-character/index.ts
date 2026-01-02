import { Character } from "../character";

export class NonPlayerCharacter extends Character {

    constructor(id: string, name: string, roomId: string) {
        super(id, name, roomId);
    }

}

