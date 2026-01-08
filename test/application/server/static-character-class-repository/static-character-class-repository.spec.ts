import { StaticCharacterClassRepository } from "../../../../src/application/server/static-character-class-repository";
import { expect } from "chai";

describe(`[Class] StaticCharacterClassRepository`, () => {

    describe(`[Method] findAll`, () => {

        it(`should return the configured classes`, async () => {
            const repository = new StaticCharacterClassRepository([
                {
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                }
            ]);

            const classes = await repository.findAll();

            expect(classes).to.deep.equal([
                {
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                }
            ]);
        });

    });

});

