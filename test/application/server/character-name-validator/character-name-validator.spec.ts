import { CharacterNameValidator } from "../../../../src/application/server/character-name-validator";
import { expect } from "chai";

describe(`[Class] CharacterNameValidator`, () => {

    describe(`[Method] formatName`, () => {

        it(`should format the name with proper casing`, () => {
            const validator = new CharacterNameValidator();

            expect(validator.formatName("  aLeX  ")).to.equal("Alex");
        });

        it(`should return an empty string for blank names`, () => {
            const validator = new CharacterNameValidator();

            expect(validator.formatName("   ")).to.equal("");
        });

    });

    describe(`[Method] validate`, () => {

        it(`should accept valid character names`, () => {
            const validator = new CharacterNameValidator();

            const result = validator.validate("riley");

            expect(result).to.deep.equal({ error: null, formattedName: "Riley", isValid: true });
        });

        it(`should reject names that are too short`, () => {
            const validator = new CharacterNameValidator();

            const result = validator.validate("Ale");

            expect(result.isValid).to.equal(false);
            expect(result.error).to.equal("Character name must be between 4 and 15 letters.");
        });

        it(`should reject names with non-letter characters`, () => {
            const validator = new CharacterNameValidator();

            const result = validator.validate("Hero-1");

            expect(result.isValid).to.equal(false);
            expect(result.error).to.equal("Character name must be one word with letters only.");
        });

        it(`should reject names with too many repeated vowels`, () => {
            const validator = new CharacterNameValidator();

            const result = validator.validate("Sooooa");

            expect(result.isValid).to.equal(false);
            expect(result.error).to.equal("Character name cannot repeat the same vowel more than three times in a row.");
        });

    });

});
