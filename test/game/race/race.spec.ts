import { expect } from "chai";

import { Race } from "../../../src/game/race";

describe(`[Class] Race`, () => {
    const baseHealth = 10;
    const humanBaseAttributes = {
        agility: 10,
        charisma: 12,
        constitution: 10,
        dexterity: 10,
        health: 42,
        intelligence: 10,
        mana: 22,
        perception: 10,
        resolve: 10,
        strength: 10,
        wisdom: 10
    };

    const creatureBaseAttributes = {
        agility: 11,
        charisma: 6,
        constitution: 12,
        dexterity: 9,
        health: 46,
        intelligence: 8,
        mana: 16,
        perception: 11,
        resolve: 9,
        strength: 12,
        wisdom: 8
    };

    describe(`[Method] constructor`, () => {

        it(`should initialize with id, name, and description`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);

            expect(race.id).to.equal("human");
            expect(race.name).to.equal("Human");
            expect(race.description).to.equal("Versatile adventurers.");
            expect(race.baseAttributes).to.deep.equal(humanBaseAttributes);
            expect(race.baseHealth).to.equal(10);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the race`, () => {
            const race = new Race("creature", "Creature", "Wild denizens.", creatureBaseAttributes, baseHealth);

            expect(race.toSnapshot()).to.deep.equal({
                description: "Wild denizens.",
                id: "creature",
                name: "Creature"
            });
        });

    });

});

