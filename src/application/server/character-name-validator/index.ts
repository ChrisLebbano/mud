import { type CharacterNameValidationResult } from "../types/character";

export class CharacterNameValidator {

    private _vowels: Set<string>;

    constructor() {
        this._vowels = new Set(["a", "e", "i", "o", "u"]);
    }

    public formatName(name: string): string {
        const trimmedName = name.trim();
        if (!trimmedName) {
            return "";
        }

        const lowerCased = trimmedName.toLowerCase();
        return lowerCased.charAt(0).toUpperCase() + lowerCased.slice(1);
    }

    public validate(name: string): CharacterNameValidationResult {
        const formattedName = this.formatName(name);

        if (!formattedName) {
            return { error: "Character name is required.", formattedName, isValid: false };
        }

        if (formattedName.length < 4 || formattedName.length > 15) {
            return { error: "Character name must be between 4 and 15 letters.", formattedName, isValid: false };
        }

        if (!/^[A-Za-z]+$/.test(formattedName)) {
            return { error: "Character name must be one word with letters only.", formattedName, isValid: false };
        }

        const lowerCasedName = formattedName.toLowerCase();
        let repeatedVowelCount = 0;
        let previousCharacter = "";

        for (const character of lowerCasedName) {
            if (character === previousCharacter && this._vowels.has(character)) {
                repeatedVowelCount += 1;
            } else if (this._vowels.has(character)) {
                repeatedVowelCount = 1;
            } else {
                repeatedVowelCount = 0;
            }

            if (repeatedVowelCount > 3) {
                return { error: "Character name cannot repeat the same vowel more than three times in a row.", formattedName, isValid: false };
            }

            previousCharacter = character;
        }

        return { error: null, formattedName, isValid: true };
    }

}
