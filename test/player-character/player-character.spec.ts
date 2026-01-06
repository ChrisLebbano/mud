import { expect } from "chai";

import { CharacterClass } from "../../src/character-class";
import { NonPlayerCharacter } from "../../src/non-player-character";
import { PlayerCharacter } from "../../src/player-character";
import { Race } from "../../src/race";

describe(`[Class] PlayerCharacter`, () => {
    const humanBaseAttributes = {
        agility: 10,
        charisma: 12,
        constitution: 10,
        dexterity: 10,
        health: 42,
        intelligence: 10,
        mana: 22,
        perception: 10,
        resolve: 10,
        strength: 10,
        wisdom: 10
    };

    const creatureBaseAttributes = {
        agility: 11,
        charisma: 6,
        constitution: 12,
        dexterity: 9,
        health: 46,
        intelligence: 8,
        mana: 16,
        perception: 11,
        resolve: 9,
        strength: 12,
        wisdom: 8
    };

    const clericModifiers = {
        agility: 0,
        charisma: 1,
        constitution: 1,
        dexterity: 0,
        health: 4,
        intelligence: 2,
        mana: 6,
        perception: 1,
        resolve: 2,
        strength: -1,
        wisdom: 2
    };

    const warriorModifiers = {
        agility: 1,
        charisma: -1,
        constitution: 2,
        dexterity: 1,
        health: 6,
        intelligence: -1,
        mana: -2,
        perception: 0,
        resolve: 1,
        strength: 2,
        wisdom: -1
    };

    describe(`[Method] constructor`, () => {

        it(`should initialize a player character with id, name, and room`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
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
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const playerCharacter = new PlayerCharacter("player-2", "Riley", "lounge", race, characterClass);

            expect(playerCharacter.toSnapshot()).to.deep.equal({
                attributes: {
                    agility: 11,
                    charisma: 11,
                    constitution: 12,
                    dexterity: 11,
                    health: 48,
                    intelligence: 9,
                    mana: 20,
                    perception: 10,
                    resolve: 11,
                    strength: 12,
                    wisdom: 9
                },
                characterClass: {
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                },
                currentHealth: 48,
                id: "player-2",
                maxHealth: 48,
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
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const targetClass = new CharacterClass("cleric", "Cleric", "Devout healers.", clericModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const creatureRace = new Race("creature", "Creature", "Wild denizens.", creatureBaseAttributes);
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
