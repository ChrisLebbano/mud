import { Room } from "../../src/room";
import { Zone } from "../../src/zone";
import { expect } from "chai";

describe(`[Class] Zone`, () => {

    describe(`[Method] getRoom`, () => {

        it(`should return rooms by id`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", {});
            const zone = new Zone("starter-zone", "Starter Zone", [room], "atrium");

            expect(zone.getRoom("atrium")).to.equal(room);
            expect(zone.getRoom("missing")).to.equal(undefined);
        });

    });

    describe(`[Method] getters`, () => {

        it(`should expose zone metadata`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", {});
            const zone = new Zone("starter-zone", "Starter Zone", [room], "atrium");

            expect(zone.id).to.equal("starter-zone");
            expect(zone.name).to.equal("Starter Zone");
            expect(zone.rooms).to.deep.equal([room]);
            expect(zone.startingRoomId).to.equal("atrium");
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the zone`, () => {
            const zone = new Zone("starter-zone", "Starter Zone", [], "atrium");

            expect(zone.toSnapshot()).to.deep.equal({
                id: "starter-zone",
                name: "Starter Zone"
            });
        });

    });

});

