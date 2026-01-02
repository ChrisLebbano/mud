import { Character } from "../character";
import { type PlayerSnapshot } from "../types";

export class PlayerCharacter extends Character {

    constructor(id: string, name: string, roomId: string) {
        super(id, name, roomId);
    }

    public toSnapshot(): PlayerSnapshot {
        return {
            attributes: this.attributes.toSnapshot(),
            id: this.id,
            name: this.name,
            roomId: this.roomId
        };
    }

}
