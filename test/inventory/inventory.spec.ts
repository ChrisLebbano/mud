import { expect } from "chai";

import { Inventory } from "../../src/inventory";

describe(`[Class] Inventory`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize with eight empty slots`, () => {
            const inventory = new Inventory();

            expect(inventory.maxSlots).to.equal(8);
            expect(inventory.slots).to.have.lengthOf(8);
            expect(inventory.slots.every((slot) => slot === null)).to.equal(true);
        });

    });

    describe(`[Method] maxSlots`, () => {

        it(`should return the maximum slot count`, () => {
            const inventory = new Inventory();

            expect(inventory.maxSlots).to.equal(8);
        });

    });

    describe(`[Method] slots`, () => {

        it(`should return the slots`, () => {
            const inventory = new Inventory();

            expect(inventory.slots).to.have.lengthOf(8);
        });

    });

});

