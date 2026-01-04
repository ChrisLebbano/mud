import { expect } from "chai";

import { CharacterAttributes } from "../../src/character-attributes";

describe(`[Class] CharacterAttributes`, () => {

    describe(`[Method] constructor`, () => {

        it(`should set health and mana`, () => {
            const attributes = new CharacterAttributes(40, 20);

            expect(attributes.agility).to.equal(10);
            expect(attributes.charisma).to.equal(10);
            expect(attributes.constitution).to.equal(10);
            expect(attributes.dexterity).to.equal(10);
            expect(attributes.health).to.equal(40);
            expect(attributes.intelligence).to.equal(10);
            expect(attributes.mana).to.equal(20);
            expect(attributes.perception).to.equal(10);
            expect(attributes.resolve).to.equal(10);
            expect(attributes.strength).to.equal(10);
            expect(attributes.wisdom).to.equal(10);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot`, () => {
            const attributes = new CharacterAttributes(50, 10);

            expect(attributes.toSnapshot()).to.deep.equal({
                agility: 10,
                charisma: 10,
                constitution: 10,
                dexterity: 10,
                health: 50,
                intelligence: 10,
                mana: 10,
                perception: 10,
                resolve: 10,
                strength: 10,
                wisdom: 10
            });
        });

    });

});
