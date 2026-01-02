import { expect } from "chai";

import { Character } from "../../src/character";

describe(`[Class] Character`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize the character with id, name, and room`, () => {
            const character = new Character("character-1", "Alex", "atrium");

            expect(character.attributes.health).to.equal(40);
            expect(character.attributes.mana).to.equal(20);
            expect(character.id).to.equal("character-1");
            expect(character.name).to.equal("Alex");
            expect(character.roomId).to.equal("atrium");
        });

    });

    describe(`[Method] roomId`, () => {

        it(`should update the room id`, () => {
            const character = new Character("character-2", "Riley", "atrium");

            character.roomId = "lounge";

            expect(character.roomId).to.equal("lounge");
        });

    });

});
