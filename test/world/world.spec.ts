import { Room } from "../../src/room";
import { World } from "../../src/world";
import { Zone } from "../../src/zone";
import { expect } from "chai";

describe(`[Class] World`, () => {

    describe(`[Method] addPlayer`, () => {

        it(`should add players to the starting room`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], "starter-zone", "atrium");

            const result = world.addPlayer("player-1", "Alex");

            expect(result.roomId).to.equal("atrium");
            expect(result.roomSnapshot.players).to.include("Alex");
        });

    });

    describe(`[Method] movePlayer`, () => {

        it(`should move players between rooms`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex");
            const moveResult = world.movePlayer("player-1", "north");

            if ("error" in moveResult) {
                throw new Error(moveResult.error);
            }

            expect(moveResult.fromRoomId).to.equal("atrium");
            expect(moveResult.toRoomId).to.equal("lounge");
            expect(moveResult.roomSnapshot.id).to.equal("lounge");
        });

    });

    describe(`[Method] removePlayer`, () => {

        it(`should remove players from the world`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex");
            const removed = world.removePlayer("player-1");

            expect(removed).to.deep.equal({ playerName: "Alex", roomId: "atrium" });
            expect(world.getPlayer("player-1")).to.equal(undefined);
        });

    });

    describe(`[Method] say`, () => {

        it(`should return chat scoped to the player room`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex");
            world.addPlayer("player-2", "Riley");

            const moveResult = world.movePlayer("player-2", "north");
            if ("error" in moveResult) {
                throw new Error(moveResult.error);
            }

            const chatResult = world.say("player-2", "Hello from the lounge");
            if ("error" in chatResult) {
                throw new Error(chatResult.error);
            }

            expect(chatResult.chatMessage.message).to.equal("Riley says, \"Hello from the lounge\".");
            expect(chatResult.chatMessage.roomId).to.equal("lounge");
            expect(chatResult.chatMessage.playerName).to.equal("Riley");
        });

    });

    describe(`[Method] getRoom`, () => {

        it(`should return rooms by id`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], "starter-zone", "atrium");

            const room = world.getRoom("atrium");

            expect(room?.name).to.equal("Atrium");
        });

    });

    describe(`[Method] getRoomSnapshot`, () => {

        it(`should include player names in snapshots`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex");
            const snapshot = world.getRoomSnapshot("atrium", "player-1");

            expect(snapshot.players).to.deep.equal(["Alex"]);
            expect(snapshot.player).to.deep.equal({
                attributes: { health: 40, mana: 20 },
                id: "player-1",
                name: "Alex",
                roomId: "atrium"
            });
            expect(snapshot.zone).to.deep.equal({ id: "starter-zone", name: "Starter Zone" });
        });

    });

});
