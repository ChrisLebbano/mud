import { Character } from "../character";
import { Race } from "../race";
import { type PlayerSnapshot } from "../types";

export class PlayerCharacter extends Character {

    constructor(id: string, name: string, roomId: string, race: Race) {
        super(id, name, roomId, race);
    }

    public toSnapshot(): PlayerSnapshot {
        const primaryTarget = this.primaryTarget;
        const primaryTargetVitals = primaryTarget ? {
            currentHealth: primaryTarget.secondaryAttributes.currentHealth,
            maxHealth: primaryTarget.secondaryAttributes.maxHealth
        } : undefined;

        return {
            attributes: this.attributes.toSnapshot(),
            currentHealth: this.secondaryAttributes.currentHealth,
            id: this.id,
            maxHealth: this.secondaryAttributes.maxHealth,
            name: this.name,
            primaryTargetName: this.primaryTarget?.name,
            primaryTargetVitals,
            race: this.race.toSnapshot(),
            roomId: this.roomId
        };
    }

}

