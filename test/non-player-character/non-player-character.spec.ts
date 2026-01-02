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

    describe(`[Method] hailResponse`, () => {

        it(`should return the hail response when set`, () => {
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", "Greetings traveler.");

            expect(nonPlayerCharacter.hailResponse).to.equal("Greetings traveler.");
        });

    });

    describe(`[Method] respondToHail`, () => {

        it(`should return the hail response when available`, () => {
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", "Hello there.");

            expect(nonPlayerCharacter.respondToHail()).to.equal("Hello there.");
        });

        it(`should return undefined when no hail response is configured`, () => {
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium");

            expect(nonPlayerCharacter.respondToHail()).to.equal(undefined);
        });

    });

});
