import { expect } from "chai";
import { Application } from "../../src/application";
import { CharacterClass } from "../../src/character-class";
import { Race } from "../../src/race";
import { Room } from "../../src/room";
import { Server } from "../../src/server";
import { type DatabaseConnectionClient, type DatabasePoolFactory, type NodeHttpServer } from "../../src/types";
import { World } from "../../src/world";
import { Zone } from "../../src/zone";

class FakeDatabaseConnection implements DatabaseConnectionClient {

    private _connectCalled = false;

    public connect(): ReturnType<DatabasePoolFactory> {
        this._connectCalled = true;
        return {} as ReturnType<DatabasePoolFactory>;
    }

    public get connectCalled(): boolean {
        return this._connectCalled;
    }

    public testConnection(_stage: string): Promise<void> {
        return Promise.resolve();
    }

}

describe(`[Class] Application`, () => {
    const humanBaseAttributes = {
        agility: 10,
        charisma: 12,
        constitution: 10,
        dexterity: 10,
        health: 42,
        intelligence: 10,
        mana: 22,
        perception: 10,
        resolve: 10,
        strength: 10,
        wisdom: 10
    };

    const warriorModifiers = {
        agility: 1,
        charisma: -1,
        constitution: 2,
        dexterity: 1,
        health: 6,
        intelligence: -1,
        mana: -2,
        perception: 0,
        resolve: 1,
        strength: 2,
        wisdom: -1
    };

    const createWorld = (): World => {
        const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers);
        const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes);
        return new World([new Zone("test-zone", "Test Zone", [
            new Room("test-room", "Test Room", "A test room.", {})
        ], "test-room")], [race], [characterClass], "test-zone", "test-room", "human", "warrior");
    };

    describe(`[Method] init`, () => {

        it(`should create an instance of a server`, () => {
            const originalStart = Server.prototype.start;
            const databaseConnection = new FakeDatabaseConnection();
            let startCalled = false;

            Server.prototype.start = function (): NodeHttpServer {
                startCalled = true;
                return {} as NodeHttpServer;
            };

            const app = new Application({ port: 8000 }, createWorld(), databaseConnection);

            expect(app.server).to.be.undefined;

            app.init();

            expect(app.server).to.be.ok;
            expect(databaseConnection.connectCalled).to.equal(true);
            expect(startCalled).to.equal(true);

            Server.prototype.start = originalStart;
        });

    });

});
