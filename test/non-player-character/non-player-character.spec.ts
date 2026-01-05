import { expect } from "chai";

import { NonPlayerCharacter } from "../../src/non-player-character";
import { Race } from "../../src/race";

describe(`[Class] NonPlayerCharacter`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize a non-player character with id, name, and room`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race);

            expect(nonPlayerCharacter.id).to.equal("npc-1");
            expect(nonPlayerCharacter.name).to.equal("Guide");
            expect(nonPlayerCharacter.roomId).to.equal("atrium");
        });

        it(`should initialize secondary attributes when max health is provided`, () => {
            const race = new Race("creature", "Creature", "Wild denizens.");
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Rat", "training-grounds", race, undefined, 20);

            expect(nonPlayerCharacter.secondaryAttributes.currentHealth).to.equal(20);
            expect(nonPlayerCharacter.secondaryAttributes.maxHealth).to.equal(20);
        });

        it(`should set default attack damage and delay`, () => {
            const race = new Race("creature", "Creature", "Wild denizens.");
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Rat", "training-grounds", race);

            expect(nonPlayerCharacter.secondaryAttributes.attackDamage).to.equal(5);
            expect(nonPlayerCharacter.secondaryAttributes.attackDelaySeconds).to.equal(5);
        });

    });

    describe(`[Method] hailResponse`, () => {

        it(`should return the hail response when set`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race, "Greetings traveler.");

            expect(nonPlayerCharacter.hailResponse).to.equal("Greetings traveler.");
        });

    });

    describe(`[Method] respondToHail`, () => {

        it(`should return the hail response when available`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race, "Hello there.");

            expect(nonPlayerCharacter.respondToHail()).to.equal("Hello there.");
        });

        it(`should return undefined when no hail response is configured`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const nonPlayerCharacter = new NonPlayerCharacter("npc-1", "Guide", "atrium", race);

            expect(nonPlayerCharacter.respondToHail()).to.equal(undefined);
        });

    });

});
