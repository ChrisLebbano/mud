import { CharacterRepository } from "../../../../src/application/server/character-repository";
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

describe(`[Class] CharacterRepository`, () => {

    describe(`[Method] createCharacter`, () => {

        it(`should insert a new character`, async () => {
            const pool = new FakePool();
            pool.queueResult({ insertId: 22 });
            const repository = new CharacterRepository(new FakeDatabaseConnection(pool));

            const result = await repository.createCharacter({
                className: "Warrior",
                name: "Alex",
                raceName: "Human",
                userId: 11
            });

            expect(result).to.deep.equal({
                className: "Warrior",
                id: 22,
                name: "Alex",
                raceName: "Human",
                userId: 11
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["Alex", 11, "Human", "Warrior"],
                    statement: "INSERT INTO characters (name, user_id, race_name, class_name) VALUES (?, ?, ?, ?)"
                }
            ]);
        });

    });

    describe(`[Method] findByName`, () => {

        it(`should return a character when found`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    class_name: "Cleric",
                    id: 8,
                    name: "Riley",
                    race_name: "Elf",
                    user_id: 3
                }
            ]);
            const repository = new CharacterRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByName("Riley");

            expect(result).to.deep.equal({
                className: "Cleric",
                id: 8,
                name: "Riley",
                raceName: "Elf",
                userId: 3
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["Riley"],
                    statement: "SELECT id, name, user_id, race_name, class_name FROM characters WHERE name = ? LIMIT 1"
                }
            ]);
        });

        it(`should return null when no match is found`, async () => {
            const pool = new FakePool();
            pool.queueResult([]);
            const repository = new CharacterRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByName("Missing");

            expect(result).to.equal(null);
        });

    });

    describe(`[Method] findByUserId`, () => {

        it(`should return characters for a user`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    class_name: "Warrior",
                    id: 1,
                    name: "Alex",
                    race_name: "Human",
                    user_id: 7
                },
                {
                    class_name: "Cleric",
                    id: 2,
                    name: "Riley",
                    race_name: "Elf",
                    user_id: 7
                }
            ]);
            const repository = new CharacterRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByUserId(7);

            expect(result).to.deep.equal([
                {
                    className: "Warrior",
                    id: 1,
                    name: "Alex",
                    raceName: "Human",
                    userId: 7
                },
                {
                    className: "Cleric",
                    id: 2,
                    name: "Riley",
                    raceName: "Elf",
                    userId: 7
                }
            ]);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [7],
                    statement: "SELECT id, name, user_id, race_name, class_name FROM characters WHERE user_id = ? ORDER BY name ASC"
                }
            ]);
        });

    });

});
