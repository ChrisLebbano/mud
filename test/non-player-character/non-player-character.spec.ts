import { expect } from "chai";

import { NonPlayerCharacter } from "../../src/non-player-character";

describe(`[Class] NonPlayerCharacter`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize a non-player character with id, name, and room`, () => {
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium");

            expect(nonPlayerCharacter.id).to.equal("npc-1");
            expect(nonPlayerCharacter.name).to.equal("Guide");
            expect(nonPlayerCharacter.roomId).to.equal("atrium");
        });

    });

});

