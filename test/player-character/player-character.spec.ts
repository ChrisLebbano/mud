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

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot with attributes`, () => {
            const playerCharacter = new PlayerCharacter("player-2", "Riley", "lounge");

            expect(playerCharacter.toSnapshot()).to.deep.equal({
                attributes: {
                    agility: 10,
                    charisma: 10,
                    constitution: 10,
                    dexterity: 10,
                    health: 40,
                    intelligence: 10,
                    mana: 20,
                    perception: 10,
                    resolve: 10,
                    strength: 10,
                    wisdom: 10
                },
                id: "player-2",
                name: "Riley",
                primaryTargetName: undefined,
                roomId: "lounge"
            });
        });

    });

});
