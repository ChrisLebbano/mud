import { Room } from "../../src/room";
import { expect } from "chai";

describe(`[Class] Room`, () => {

    describe(`[Method] addPlayer`, () => {

        it(`should track players entering and leaving`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge" });

            room.addPlayer("player-1");
            room.addPlayer("player-2");

            expect(room.playerIds).to.have.members(["player-1", "player-2"]);

            room.removePlayer("player-1");

            expect(room.playerIds).to.deep.equal(["player-2"]);
        });

    });

    describe(`[Method] getters`, () => {

        it(`should expose room metadata`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge" });

            expect(room.description).to.equal("A bright room.");
            expect(room.exitMap).to.deep.equal({ north: "lounge" });
            expect(room.id).to.equal("atrium");
            expect(room.name).to.equal("Atrium");
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the room`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge", south: "garden" });
            const snapshot = room.toSnapshot(["Zoe", "Alex"]);

            expect(snapshot).to.deep.equal({
                description: "A bright room.",
                exits: ["north", "south"],
                id: "atrium",
                name: "Atrium",
                players: ["Alex", "Zoe"]
            });
        });

    });

});
