import { RaceRepository } from "../../../../src/application/server/race-repository";
import { type DatabaseConnectionClient, type DatabasePoolFactory } from "../../../../src/application/server/types/database";
import { expect } from "chai";

interface ExecuteCall {
    params: unknown[];
    statement: string;
}

class FakePool {

    private _executeCalls: ExecuteCall[] = [];
    private _results: unknown[] = [];

    public execute<T>(statement: string, params: unknown[]): Promise<[T, unknown[]]> {
        this._executeCalls.push({ params, statement });
        const result = this._results.shift() as T;
        return Promise.resolve([result, []]);
    }

    public get executeCalls(): ExecuteCall[] {
        return this._executeCalls;
    }

    public queueResult(result: unknown): void {
        this._results.push(result);
    }

}

class FakeDatabaseConnection implements DatabaseConnectionClient {

    private _pool: FakePool;

    constructor(pool: FakePool) {
        this._pool = pool;
    }

    public connect(): ReturnType<DatabasePoolFactory> {
        return this._pool as unknown as ReturnType<DatabasePoolFactory>;
    }

    public testConnection(_stage: string): Promise<boolean> {
        return Promise.resolve(true);
    }

}

describe(`[Class] RaceRepository`, () => {

    describe(`[Method] findAll`, () => {

        it(`should return races ordered by name`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    agility: 10,
                    base_health: 10,
                    charisma: 12,
                    constitution: 10,
                    description: "Versatile adventurers.",
                    dexterity: 10,
                    health: 42,
                    id: 1,
                    intelligence: 10,
                    mana: 22,
                    name: "Human",
                    perception: 10,
                    player_character_allowed: 1,
                    race_key: "human",
                    resolve: 10,
                    strength: 10,
                    wisdom: 10
                },
                {
                    agility: 8,
                    base_health: 10,
                    charisma: 9,
                    constitution: 12,
                    description: "Sturdy explorers.",
                    dexterity: 8,
                    health: 48,
                    id: 2,
                    intelligence: 9,
                    mana: 16,
                    name: "Dwarf",
                    perception: 9,
                    player_character_allowed: 1,
                    race_key: "dwarf",
                    resolve: 11,
                    strength: 12,
                    wisdom: 10
                }
            ]);
            const repository = new RaceRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findAll();

            expect(result).to.deep.equal([
                {
                    baseAttributes: {
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
                    },
                    baseHealth: 10,
                    description: "Versatile adventurers.",
                    id: 1,
                    name: "Human",
                    playerCharacterAllowed: true,
                    raceKey: "human"
                },
                {
                    baseAttributes: {
                        agility: 8,
                        charisma: 9,
                        constitution: 12,
                        dexterity: 8,
                        health: 48,
                        intelligence: 9,
                        mana: 16,
                        perception: 9,
                        resolve: 11,
                        strength: 12,
                        wisdom: 10
                    },
                    baseHealth: 10,
                    description: "Sturdy explorers.",
                    id: 2,
                    name: "Dwarf",
                    playerCharacterAllowed: true,
                    raceKey: "dwarf"
                }
            ]);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [],
                    statement: "SELECT id, race_key, name, description, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana, base_health, player_character_allowed FROM races ORDER BY name ASC"
                }
            ]);
        });

    });

    describe(`[Method] findByName`, () => {

        it(`should return a matching race`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    agility: 9,
                    base_health: 10,
                    charisma: 8,
                    constitution: 12,
                    description: "Wilder kin.",
                    dexterity: 9,
                    health: 44,
                    id: 3,
                    intelligence: 9,
                    mana: 14,
                    name: "Creature",
                    perception: 11,
                    player_character_allowed: 0,
                    race_key: "creature",
                    resolve: 9,
                    strength: 12,
                    wisdom: 8
                }
            ]);
            const repository = new RaceRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByName("Creature");

            expect(result).to.deep.equal({
                baseAttributes: {
                    agility: 9,
                    charisma: 8,
                    constitution: 12,
                    dexterity: 9,
                    health: 44,
                    intelligence: 9,
                    mana: 14,
                    perception: 11,
                    resolve: 9,
                    strength: 12,
                    wisdom: 8
                },
                baseHealth: 10,
                description: "Wilder kin.",
                id: 3,
                name: "Creature",
                playerCharacterAllowed: false,
                raceKey: "creature"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["Creature"],
                    statement: "SELECT id, race_key, name, description, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana, base_health, player_character_allowed FROM races WHERE LOWER(name) = LOWER(?) LIMIT 1"
                }
            ]);
        });

        it(`should return null when no race matches`, async () => {
            const pool = new FakePool();
            pool.queueResult([]);
            const repository = new RaceRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByName("Unknown");

            expect(result).to.equal(null);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["Unknown"],
                    statement: "SELECT id, race_key, name, description, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana, base_health, player_character_allowed FROM races WHERE LOWER(name) = LOWER(?) LIMIT 1"
                }
            ]);
        });

    });

});

