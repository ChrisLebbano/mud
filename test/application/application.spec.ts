import { expect } from "chai";
import { Application } from "../../src/application";
import { CharacterClass } from "../../src/character-class";
import { Race } from "../../src/race";
import { Room } from "../../src/room";
import { Server } from "../../src/server";
import { type NodeHttpServer } from "../../src/types";
import { World } from "../../src/world";
import { Zone } from "../../src/zone";

describe(`[Class] Application`, () => {

    const createWorld = (): World => {
        const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.");
        const race = new Race("human", "Human", "Versatile adventurers.");
        return new World([new Zone("test-zone", "Test Zone", [
            new Room("test-room", "Test Room", "A test room.", {})
        ], "test-room")], [race], [characterClass], "test-zone", "test-room", "human", "warrior");
    };

    describe(`[Method] init`, () => {

        it(`should create an instance of a server`, () => {
            const originalStart = Server.prototype.start;
            let startCalled = false;

            Server.prototype.start = function (): NodeHttpServer {
                startCalled = true;
                return {} as NodeHttpServer;
            };

            const app = new Application({ port: 8000 }, createWorld());

            expect(app.server).to.be.undefined;

            app.init();

            expect(app.server).to.be.ok;
            expect(startCalled).to.equal(true);

            Server.prototype.start = originalStart;
        });

    });

});
