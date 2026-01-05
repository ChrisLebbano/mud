import { expect } from "chai";

import { CharacterClass } from "../../src/character-class";
import { NonPlayerCharacter } from "../../src/non-player-character";
import { PlayerCharacter } from "../../src/player-character";
import { Race } from "../../src/race";

describe(`[Class] PlayerCharacter`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize a player character with id, name, and room`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.");
            const race = new Race("human", "Human", "Versatile adventurers.");
            const playerCharacter = new PlayerCharacter("player-1", "Alex", "atrium", race, characterClass);

            expect(playerCharacter.id).to.equal("player-1");
            expect(playerCharacter.name).to.equal("Alex");
            expect(playerCharacter.roomId).to.equal("atrium");
            expect(playerCharacter.secondaryAttributes.currentExperience).to.equal(0);
            expect(playerCharacter.secondaryAttributes.experienceUntilNextLevel).to.equal(1000);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot with attributes`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.");
            const race = new Race("human", "Human", "Versatile adventurers.");
            const playerCharacter = new PlayerCharacter("player-2", "Riley", "lounge", race, characterClass);

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
                characterClass: {
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                },
                currentHealth: 40,
                id: "player-2",
                maxHealth: 40,
                name: "Riley",
                primaryTargetName: undefined,
                primaryTargetVitals: undefined,
                race: {
                    description: "Versatile adventurers.",
                    id: "human",
                    name: "Human"
                },
                roomId: "lounge"
            });
        });

        it(`should include primary target vitals in snapshots`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.");
            const targetClass = new CharacterClass("cleric", "Cleric", "Devout healers.");
            const race = new Race("human", "Human", "Versatile adventurers.");
            const creatureRace = new Race("creature", "Creature", "Wild denizens.");
            const playerCharacter = new PlayerCharacter("player-3", "Jordan", "atrium", race, characterClass);
            const target = new NonPlayerCharacter("npc-1", "Guard", "atrium", creatureRace, targetClass);

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
