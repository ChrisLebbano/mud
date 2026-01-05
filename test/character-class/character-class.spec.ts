import { expect } from "chai";

import { CharacterClass } from "../../src/character-class";

describe(`[Class] CharacterClass`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize with id, name, and description`, () => {
            const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.");

            expect(characterClass.id).to.equal("warrior");
            expect(characterClass.name).to.equal("Warrior");
            expect(characterClass.description).to.equal("Disciplined fighters.");
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the class`, () => {
            const characterClass = new CharacterClass("cleric", "Cleric", "Devout healers.");

            expect(characterClass.toSnapshot()).to.deep.equal({
                description: "Devout healers.",
                id: "cleric",
                name: "Cleric"
            });
        });

    });

});

