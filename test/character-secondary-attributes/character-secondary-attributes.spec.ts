import { expect } from "chai";

import { CharacterSecondaryAttributes } from "../../src/character-secondary-attributes";

describe(`[Class] CharacterSecondaryAttributes`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize defaults based on max health`, () => {
            const attributes = new CharacterSecondaryAttributes(45);

            expect(attributes.attackDelaySeconds).to.equal(5);
            expect(attributes.currentHealth).to.equal(45);
            expect(attributes.attackDamage).to.equal(10);
            expect(attributes.maxHealth).to.equal(45);
        });

    });

    describe(`[Method] attackDelaySeconds`, () => {

        it(`should update the attack delay`, () => {
            const attributes = new CharacterSecondaryAttributes(30);

            attributes.attackDelaySeconds = 3;

            expect(attributes.attackDelaySeconds).to.equal(3);
        });

    });

    describe(`[Method] applyDamage`, () => {

        it(`should reduce current health by damage`, () => {
            const attributes = new CharacterSecondaryAttributes(30);

            const remainingHealth = attributes.applyDamage(12);

            expect(remainingHealth).to.equal(18);
            expect(attributes.currentHealth).to.equal(18);
        });

    });

    describe(`[Method] currentHealth`, () => {

        it(`should update the current health`, () => {
            const attributes = new CharacterSecondaryAttributes(30);

            attributes.currentHealth = 5;

            expect(attributes.currentHealth).to.equal(5);
        });

    });

    describe(`[Method] attackDamage`, () => {

        it(`should update the damage value`, () => {
            const attributes = new CharacterSecondaryAttributes(30);

            attributes.attackDamage = 18;

            expect(attributes.attackDamage).to.equal(18);
        });

    });

    describe(`[Method] isAlive`, () => {

        it(`should reflect when current health is above zero`, () => {
            const attributes = new CharacterSecondaryAttributes(30);

            expect(attributes.isAlive).to.equal(true);

            attributes.currentHealth = 0;

            expect(attributes.isAlive).to.equal(false);
        });

    });

    describe(`[Method] maxHealth`, () => {

        it(`should return the max health`, () => {
            const attributes = new CharacterSecondaryAttributes(50);

            expect(attributes.maxHealth).to.equal(50);
        });

    });

});
