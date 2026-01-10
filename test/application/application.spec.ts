import { Application } from "../../src/application";
import { Server } from "../../src/application/server";
import { type DatabaseConnectionClient, type DatabasePoolFactory } from "../../src/application/server/types/database";
import { type NodeHttpServer } from "../../src/application/server/types/http";
import { CharacterClass } from "../../src/game/character-class";
import { Race } from "../../src/game/race";
import { Room } from "../../src/game/room";
import { World } from "../../src/game/world";
import { Zone } from "../../src/game/zone";
import { expect } from "chai";

class FakeDatabaseConnection implements DatabaseConnectionClient {

    private _connectCalled = false;

    public connect(): ReturnType<DatabasePoolFactory> {
        this._connectCalled = true;
        return {} as ReturnType<DatabasePoolFactory>;
    }

    public get connectCalled(): boolean {
        return this._connectCalled;
    }

    public testConnection(_stage: string): Promise<boolean> {
        return Promise.resolve(true);
    }

}

describe(`[Class] Application`, () => {
    const baseHealth = 10;
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
        const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
        const race = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
        return new World([new Zone("test-zone", "Test Zone", [
            new Room("test-room", "Test Room", "A test room.", {})
        ], "test-room")], [race], [characterClass], "test-zone", "test-room");
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

