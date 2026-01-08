import { StaticRaceRepository } from "../../../../src/application/server/static-race-repository";
import { expect } from "chai";

describe(`[Class] StaticRaceRepository`, () => {

    describe(`[Method] findAll`, () => {

        it(`should return the configured races`, async () => {
            const repository = new StaticRaceRepository([
                {
                    description: "Versatile adventurers.",
                    id: "human",
                    name: "Human"
                }
            ]);

            const races = await repository.findAll();

            expect(races).to.deep.equal([
                {
                    description: "Versatile adventurers.",
                    id: "human",
                    name: "Human"
                }
            ]);
        });

    });

});

