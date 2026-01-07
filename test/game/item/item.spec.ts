import { Item } from "../../../src/game/item";
import { ITEM_TYPE } from "../../../src/game/types/item-type";
import { expect } from "chai";

describe(`[Class] Item`, () => {

    describe(`[Method] constructor`, () => {

        it(`should assign defaults and increment ids`, () => {
            const firstItem = new Item("small health potion", "A vial of red liquid.", ITEM_TYPE.POTION);
            const secondItem = new Item("bread loaf", "A crusty loaf of bread.", ITEM_TYPE.FOOD, 2);

            expect(firstItem.maxCount).to.equal(1);
            expect(secondItem.maxCount).to.equal(2);
            expect(secondItem.id).to.equal(firstItem.id + 1);
        });

    });

    describe(`[Method] description`, () => {

        it(`should return the description`, () => {
            const item = new Item("water flask", "A flask filled with water.", ITEM_TYPE.DRINK);

            expect(item.description).to.equal("A flask filled with water.");
        });

    });

    describe(`[Method] id`, () => {

        it(`should return the id`, () => {
            const item = new Item("bread loaf", "A crusty loaf of bread.", ITEM_TYPE.FOOD);

            expect(item.id).to.be.a("number");
        });

    });

    describe(`[Method] maxCount`, () => {

        it(`should return the maximum count`, () => {
            const item = new Item("water flask", "A flask filled with water.", ITEM_TYPE.DRINK, 3);

            expect(item.maxCount).to.equal(3);
        });

    });

    describe(`[Method] name`, () => {

        it(`should return the name`, () => {
            const item = new Item("small health potion", "A vial of red liquid.", ITEM_TYPE.POTION);

            expect(item.name).to.equal("small health potion");
        });

    });

    describe(`[Method] type`, () => {

        it(`should return the type`, () => {
            const item = new Item("bread loaf", "A crusty loaf of bread.", ITEM_TYPE.FOOD);

            expect(item.type).to.equal(ITEM_TYPE.FOOD);
        });

    });

});
