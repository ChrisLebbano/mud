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
                    description: "Disciplined fighters.",
                    id: 3,
                    name: "Fighter"
                },
                {
                    description: "Arcane scholars.",
                    id: 4,
                    name: "Wizard"
                }
            ]);
            const repository = new CharacterClassRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findAll();

            expect(result).to.deep.equal([
                {
                    description: "Disciplined fighters.",
                    id: 3,
                    name: "Fighter"
                },
                {
                    description: "Arcane scholars.",
                    id: 4,
                    name: "Wizard"
                }
            ]);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [],
                    statement: "SELECT id, name, description FROM characterClasses ORDER BY name ASC"
                }
            ]);
        });

    });

});

