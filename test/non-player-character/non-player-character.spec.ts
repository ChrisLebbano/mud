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

        it(`should initialize secondary attributes when max health is provided`, () => {
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Rat", "training-grounds", undefined, 20);

            expect(nonPlayerCharacter.secondaryAttributes.currentHealth).to.equal(20);
            expect(nonPlayerCharacter.secondaryAttributes.maxHealth).to.equal(20);
        });

        it(`should set default attack damage and delay`, () => {
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Rat", "training-grounds");

            expect(nonPlayerCharacter.secondaryAttributes.attackDamage).to.equal(5);
            expect(nonPlayerCharacter.secondaryAttributes.attackDelaySeconds).to.equal(5);
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
