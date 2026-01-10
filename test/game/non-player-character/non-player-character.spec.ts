import { expect } from "chai";

import { CharacterClass } from "../../../src/game/character-class";
import { NonPlayerCharacter } from "../../../src/game/non-player-character";
import { Race } from "../../../src/game/race";

describe(`[Class] NonPlayerCharacter`, () => {
    const baseHealth = 10;
    const humanBaseAttributes = {
        agility: 10,
        charisma: 12,
        constitution: 10,
        dexterity: 10,
        health: 0,
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
        health: 0,
        intelligence: 8,
        mana: 16,
        perception: 11,
        resolve: 9,
        strength: 12,
        wisdom: 8
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

        it(`should initialize a non-player character with id, name, and room`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race, characterClass);

            expect(nonPlayerCharacter.id).to.equal("npc-1");
            expect(nonPlayerCharacter.name).to.equal("Guide");
            expect(nonPlayerCharacter.roomId).to.equal("atrium");
        });

        it(`should calculate secondary attribute health`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
            const race = new Race("creature", "Creature", "Wild denizens.", creatureBaseAttributes, baseHealth);
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Rat", "training-grounds", race, characterClass);

            expect(nonPlayerCharacter.secondaryAttributes.currentHealth).to.equal(36);
            expect(nonPlayerCharacter.secondaryAttributes.maxHealth).to.equal(36);
        });

        it(`should set default attack damage and delay`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
            const race = new Race("creature", "Creature", "Wild denizens.", creatureBaseAttributes, baseHealth);
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Rat", "training-grounds", race, characterClass);

            expect(nonPlayerCharacter.secondaryAttributes.attackDamage).to.equal(5);
            expect(nonPlayerCharacter.secondaryAttributes.attackDelaySeconds).to.equal(5);
        });

    });

    describe(`[Method] hailResponse`, () => {

        it(`should return the hail response when set`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race, characterClass, "Greetings traveler.");

            expect(nonPlayerCharacter.hailResponse).to.equal("Greetings traveler.");
        });

    });

    describe(`[Method] respondToHail`, () => {

        it(`should return the hail response when available`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race, characterClass, "Hello there.");

            expect(nonPlayerCharacter.respondToHail()).to.equal("Hello there.");
        });

        it(`should return undefined when no hail response is configured`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race, characterClass);

            expect(nonPlayerCharacter.respondToHail()).to.equal(undefined);
        });

    });

});

