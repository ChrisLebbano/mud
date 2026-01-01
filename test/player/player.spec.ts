import { Player } from "../../src/player";
import { expect } from "chai";

describe(`[Class] Player`, () => {

    describe(`[Method] constructor`, () => {

        it(`should initialize the player with id, name, and room`, () => {
            const player = new Player("player-1", "Alex", "atrium");

            expect(player.id).to.equal("player-1");
            expect(player.name).to.equal("Alex");
            expect(player.roomId).to.equal("atrium");
        });

    });

    describe(`[Method] roomId`, () => {

        it(`should update the room id`, () => {
            const player = new Player("player-2", "Riley", "atrium");

            player.roomId = "lounge";

            expect(player.roomId).to.equal("lounge");
        });

    });

});

