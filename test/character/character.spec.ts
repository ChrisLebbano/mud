import { expect } from "chai";

import { Character } from "../../src/character";
import { Race } from "../../src/race";

describe(`[Class] Character`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize the character with id, name, and room`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const character = new Character("character-1", "Alex", "atrium", race);

            expect(character.attributes.health).to.equal(40);
            expect(character.attributes.mana).to.equal(20);
            expect(character.id).to.equal("character-1");
            expect(character.isAttacking).to.equal(false);
            expect(character.level).to.equal(1);
            expect(character.name).to.equal("Alex");
            expect(character.race).to.equal(race);
            expect(character.roomId).to.equal("atrium");
            expect(character.secondaryAttributes.attackDelaySeconds).to.equal(5);
            expect(character.secondaryAttributes.currentHealth).to.equal(40);
            expect(character.secondaryAttributes.attackDamage).to.equal(10);
        });

    });

    describe(`[Method] roomId`, () => {

        it(`should update the room id`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const character = new Character("character-2", "Riley", "atrium", race);

            character.roomId = "lounge";

            expect(character.roomId).to.equal("lounge");
        });

    });

    describe(`[Method] primaryTarget`, () => {

        it(`should update the primary target`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const creatureRace = new Race("creature", "Creature", "Wild denizens.");
            const character = new Character("character-3", "Quinn", "atrium", race);
            const target = new Character("character-4", "Morgan", "lounge", creatureRace);

            character.primaryTarget = target;

            expect(character.primaryTarget).to.equal(target);
        });

    });

    describe(`[Method] level`, () => {

        it(`should update the level`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const character = new Character("character-6", "Jordan", "atrium", race);

            character.level = 2;

            expect(character.level).to.equal(2);
        });

    });

    describe(`[Method] isAttacking`, () => {

        it(`should update the attacking state`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");
            const character = new Character("character-5", "Casey", "atrium", race);

            character.isAttacking = true;

            expect(character.isAttacking).to.equal(true);
        });

    });

});
