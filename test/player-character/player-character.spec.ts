import { expect } from "chai";

import { NonPlayerCharacter } from "../../src/non-player-character";
import { PlayerCharacter } from "../../src/player-character";

describe(`[Class] PlayerCharacter`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize a player character with id, name, and room`, () => {
            const playerCharacter = new PlayerCharacter("player-1", "Alex", "atrium");

            expect(playerCharacter.id).to.equal("player-1");
            expect(playerCharacter.name).to.equal("Alex");
            expect(playerCharacter.roomId).to.equal("atrium");
            expect(playerCharacter.secondaryAttributes.currentExperience).to.equal(0);
            expect(playerCharacter.secondaryAttributes.experienceUntilNextLevel).to.equal(1000);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot with attributes`, () => {
            const playerCharacter = new PlayerCharacter("player-2", "Riley", "lounge");

            expect(playerCharacter.toSnapshot()).to.deep.equal({
                attributes: {
                    agility: 10,
                    charisma: 10,
                    constitution: 10,
                    dexterity: 10,
                    health: 40,
                    intelligence: 10,
                    mana: 20,
                    perception: 10,
                    resolve: 10,
                    strength: 10,
                    wisdom: 10
                },
                currentHealth: 40,
                id: "player-2",
                maxHealth: 40,
                name: "Riley",
                primaryTargetName: undefined,
                primaryTargetVitals: undefined,
                roomId: "lounge"
            });
        });

        it(`should include primary target vitals in snapshots`, () => {
            const playerCharacter = new PlayerCharacter("player-3", "Jordan", "atrium");
            const target = new NonPlayerCharacter("npc-1", "Guard", "atrium");

            playerCharacter.primaryTarget = target;

            const snapshot = playerCharacter.toSnapshot();

            expect(snapshot.primaryTargetName).to.equal("Guard");
            expect(snapshot.primaryTargetVitals).to.deep.equal({
                currentHealth: 40,
                maxHealth: 40
            });
        });

    });

});
