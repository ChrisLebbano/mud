import { Character } from "../character";
import { type PlayerSnapshot } from "../types";

export class PlayerCharacter extends Character {

    constructor(id: string, name: string, roomId: string) {
        super(id, name, roomId);
    }

    public toSnapshot(): PlayerSnapshot {
        const primaryTarget = this.primaryTarget;
        const primaryTargetVitals = primaryTarget ? {
            currentHealth: primaryTarget.secondaryAttributes.currentHealth,
            maxHealth: primaryTarget.secondaryAttributes.maxHealth
        } : undefined;

        return {
            attributes: this.attributes.toSnapshot(),
            id: this.id,
            name: this.name,
            primaryTargetName: this.primaryTarget?.name,
            primaryTargetVitals,
            roomId: this.roomId
        };
    }

}
