import { expect } from "chai";

import { Race } from "../../src/race";

describe(`[Class] Race`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize with id, name, and description`, () => {
            const race = new Race("human", "Human", "Versatile adventurers.");

            expect(race.id).to.equal("human");
            expect(race.name).to.equal("Human");
            expect(race.description).to.equal("Versatile adventurers.");
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the race`, () => {
            const race = new Race("creature", "Creature", "Wild denizens.");

            expect(race.toSnapshot()).to.deep.equal({
                description: "Wild denizens.",
                id: "creature",
                name: "Creature"
            });
        });

    });

});

