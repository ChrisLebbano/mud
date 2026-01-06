import { expect } from "chai";

import { Character } from "../../src/character";
import { CharacterClass } from "../../src/character-class";
import { Race } from "../../src/race";

describe(`[Class] Character`, () => {
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

        it(`should initialize the character with id, name, and room`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const character = new Character("character-1", "Alex", "atrium", race, characterClass);

            expect(character.attributes.health).to.equal(48);
            expect(character.attributes.mana).to.equal(20);
            expect(character.characterClass).to.equal(characterClass);
            expect(character.id).to.equal("character-1");
            expect(character.inventory.maxSlots).to.equal(8);
            expect(character.inventory.slots).to.have.lengthOf(8);
            expect(character.isAttacking).to.equal(false);
            expect(character.level).to.equal(1);
            expect(character.name).to.equal("Alex");
            expect(character.race).to.equal(race);
            expect(character.roomId).to.equal("atrium");
            expect(character.secondaryAttributes.attackDelaySeconds).to.equal(5);
            expect(character.secondaryAttributes.currentHealth).to.equal(48);
            expect(character.secondaryAttributes.attackDamage).to.equal(10);
        });

    });

    describe(`[Method] roomId`, () => {

        it(`should update the room id`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const character = new Character("character-2", "Riley", "atrium", race, characterClass);

            character.roomId = "lounge";

            expect(character.roomId).to.equal("lounge");
        });

    });

    describe(`[Method] primaryTarget`, () => {

        it(`should update the primary target`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const targetClass = new CharacterClass("cleric", "Cleric", "Devout healers.", clericModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const creatureRace = new Race("creature", "Creature", "Wild denizens.", creatureBaseAttributes);
            const character = new Character("character-3", "Quinn", "atrium", race, characterClass);
            const target = new Character("character-4", "Morgan", "lounge", creatureRace, targetClass);

            character.primaryTarget = target;

            expect(character.primaryTarget).to.equal(target);
        });

    });

    describe(`[Method] level`, () => {

        it(`should update the level`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const character = new Character("character-6", "Jordan", "atrium", race, characterClass);

            character.level = 2;

            expect(character.level).to.equal(2);
        });

    });

    describe(`[Method] isAttacking`, () => {

        it(`should update the attacking state`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
            const character = new Character("character-5", "Casey", "atrium", race, characterClass);

            character.isAttacking = true;

            expect(character.isAttacking).to.equal(true);
        });

    });

});
