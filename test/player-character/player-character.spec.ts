import { expect } from "chai";

import { PlayerCharacter } from "../../src/player-character";

describe(`[Class] PlayerCharacter`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize a player character with id, name, and room`, () => {
            const playerCharacter = new PlayerCharacter("player-1", "Alex", "atrium");

            expect(playerCharacter.id).to.equal("player-1");
            expect(playerCharacter.name).to.equal("Alex");
            expect(playerCharacter.roomId).to.equal("atrium");
        });

    });

});

