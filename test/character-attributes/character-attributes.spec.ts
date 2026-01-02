import { expect } from "chai";

import { CharacterAttributes } from "../../src/character-attributes";

describe(`[Class] CharacterAttributes`, () => {

    describe(`[Method] constructor`, () => {

        it(`should set health and mana`, () => {
            const attributes = new CharacterAttributes(40, 20);

            expect(attributes.health).to.equal(40);
            expect(attributes.mana).to.equal(20);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot`, () => {
            const attributes = new CharacterAttributes(50, 10);

            expect(attributes.toSnapshot()).to.deep.equal({ health: 50, mana: 10 });
        });

    });

});

