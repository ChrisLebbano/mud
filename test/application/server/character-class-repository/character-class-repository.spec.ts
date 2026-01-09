import { CharacterClassRepository } from "../../../../src/application/server/character-class-repository";
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

    public testConnection(_stage: string): Promise<void> {
        return Promise.resolve();
    }

}

describe(`[Class] CharacterClassRepository`, () => {

    describe(`[Method] findAll`, () => {

        it(`should return classes ordered by name`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    attributeModifiers: JSON.stringify({
                        agility: 1,
                        charisma: 0,
                        constitution: 2,
                        dexterity: 0,
                        health: 6,
                        intelligence: -1,
                        mana: -2,
                        perception: 0,
                        resolve: 1,
                        strength: 2,
                        wisdom: -1
                    }),
                    description: "Disciplined fighters.",
                    id: 3,
                    name: "Fighter"
                },
                {
                    attributeModifiers: {
                        agility: 0,
                        charisma: 1,
                        constitution: 1,
                        dexterity: 0,
                        health: 4,
                        intelligence: 2,
                        mana: 6,
                        perception: 1,
                        resolve: 2,
                        strength: -1,
                        wisdom: 2
                    },
                    description: "Arcane scholars.",
                    id: 4,
                    name: "Wizard"
                }
            ]);
            const repository = new CharacterClassRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findAll();

            expect(result).to.deep.equal([
                {
                    attributeModifiers: {
                        agility: 1,
                        charisma: 0,
                        constitution: 2,
                        dexterity: 0,
                        health: 6,
                        intelligence: -1,
                        mana: -2,
                        perception: 0,
                        resolve: 1,
                        strength: 2,
                        wisdom: -1
                    },
                    description: "Disciplined fighters.",
                    id: 3,
                    name: "Fighter"
                },
                {
                    attributeModifiers: {
                        agility: 0,
                        charisma: 1,
                        constitution: 1,
                        dexterity: 0,
                        health: 4,
                        intelligence: 2,
                        mana: 6,
                        perception: 1,
                        resolve: 2,
                        strength: -1,
                        wisdom: 2
                    },
                    description: "Arcane scholars.",
                    id: 4,
                    name: "Wizard"
                }
            ]);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [],
                    statement: "SELECT id, name, description, attributeModifiers FROM characterClasses ORDER BY name ASC"
                }
            ]);
        });

        it(`should default attribute modifiers when data is null`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    attributeModifiers: null,
                    description: "Plain class.",
                    id: 5,
                    name: "Commoner"
                }
            ]);
            const repository = new CharacterClassRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findAll();

            expect(result).to.deep.equal([
                {
                    attributeModifiers: {
                        agility: 0,
                        charisma: 0,
                        constitution: 0,
                        dexterity: 0,
                        health: 0,
                        intelligence: 0,
                        mana: 0,
                        perception: 0,
                        resolve: 0,
                        strength: 0,
                        wisdom: 0
                    },
                    description: "Plain class.",
                    id: 5,
                    name: "Commoner"
                }
            ]);
        });

    });

});

