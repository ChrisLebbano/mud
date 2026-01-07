import { Character } from "../character";
import { CharacterClass } from "../character-class";
import { Race } from "../race";
import { type PlayerSnapshot } from "../types/room";

export class PlayerCharacter extends Character {

    constructor(id: string, name: string, roomId: string, race: Race, characterClass: CharacterClass) {
        super(id, name, roomId, race, characterClass);
    }

    public toSnapshot(): PlayerSnapshot {
        const primaryTarget = this.primaryTarget;
        const primaryTargetVitals = primaryTarget ? {
            currentHealth: primaryTarget.secondaryAttributes.currentHealth,
            maxHealth: primaryTarget.secondaryAttributes.maxHealth
        } : undefined;

        return {
            attributes: this.attributes.toSnapshot(),
            characterClass: this.characterClass.toSnapshot(),
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
