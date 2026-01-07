import { expect } from "chai";

import { Inventory } from "../../../src/game/inventory";
import { Item } from "../../../src/game/item";
import { ITEM_TYPE } from "../../../src/types";

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

    describe(`[Method] addItem`, () => {

        it(`should stack items into empty slots`, () => {
            const inventory = new Inventory();
            const item = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);

            const remainingCount = inventory.addItem(item, 5);

            expect(remainingCount).to.equal(0);
            expect(inventory.slots[0]).to.deep.equal({ count: 5, item });
        });

    });

    describe(`[Method] consumeItem`, () => {

        it(`should decrement stacks and clear empty slots`, () => {
            const inventory = new Inventory();
            const item = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);

            inventory.addItem(item, 2);

            const firstConsume = inventory.consumeItem(item);
            const secondConsume = inventory.consumeItem(item);

            expect(firstConsume).to.equal(true);
            expect(secondConsume).to.equal(true);
            expect(inventory.slots[0]).to.equal(null);
        });

    });

    describe(`[Method] slots`, () => {

        it(`should return the slots`, () => {
            const inventory = new Inventory();

            expect(inventory.slots).to.have.lengthOf(8);
        });

    });

});
