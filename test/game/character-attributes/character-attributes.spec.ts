import { expect } from "chai";

import { CharacterAttributes } from "../../../src/game/character-attributes";

describe(`[Class] CharacterAttributes`, () => {
    const baseAttributes = {
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

    const attributeModifiers = {
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

        it(`should set health and mana`, () => {
            const attributes = new CharacterAttributes(baseAttributes, attributeModifiers);

            expect(attributes.agility).to.equal(11);
            expect(attributes.charisma).to.equal(11);
            expect(attributes.constitution).to.equal(12);
            expect(attributes.dexterity).to.equal(11);
            expect(attributes.health).to.equal(6);
            expect(attributes.intelligence).to.equal(9);
            expect(attributes.mana).to.equal(20);
            expect(attributes.perception).to.equal(10);
            expect(attributes.resolve).to.equal(11);
            expect(attributes.strength).to.equal(12);
            expect(attributes.wisdom).to.equal(9);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot`, () => {
            const attributes = new CharacterAttributes(baseAttributes, attributeModifiers);

            expect(attributes.toSnapshot()).to.deep.equal({
                agility: 11,
                charisma: 11,
                constitution: 12,
                dexterity: 11,
                health: 6,
                intelligence: 9,
                mana: 20,
                perception: 10,
                resolve: 11,
                strength: 12,
                wisdom: 9
            });
        });

    });

});

