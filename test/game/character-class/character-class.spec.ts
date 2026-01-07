import { expect } from "chai";

import { CharacterClass } from "../../../src/game/character-class";

describe(`[Class] CharacterClass`, () => {
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

    describe(`[Method] constructor`, () => {

        it(`should initialize with id, name, and description`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);

            expect(characterClass.id).to.equal("warrior");
            expect(characterClass.name).to.equal("Warrior");
            expect(characterClass.description).to.equal("Disciplined fighters.");
            expect(characterClass.attributeModifiers).to.deep.equal(warriorModifiers);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the class`, () => {
            const characterClass = new CharacterClass("cleric", "Cleric", "Devout healers.", clericModifiers);

            expect(characterClass.toSnapshot()).to.deep.equal({
                description: "Devout healers.",
                id: "cleric",
                name: "Cleric"
            });
        });

    });

});
