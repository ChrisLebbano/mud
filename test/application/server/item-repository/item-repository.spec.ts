import { ItemRepository } from "../../../../src/application/server/item-repository";
import { type DatabaseConnectionClient, type DatabasePoolFactory } from "../../../../src/application/server/types/database";
import { ITEM_TYPE } from "../../../../src/game/types/item-type";
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

describe(`[Class] ItemRepository`, () => {

    describe(`[Method] findAll`, () => {

        it(`should return items ordered by name`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    description: "A crusty loaf of bread.",
                    id: 2,
                    maxCount: 20,
                    name: "bread",
                    type: ITEM_TYPE.FOOD
                },
                {
                    description: "A small vial that restores a bit of health.",
                    id: 1,
                    maxCount: 20,
                    name: "small health potion",
                    type: ITEM_TYPE.POTION
                }
            ]);
            const repository = new ItemRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findAll();

            expect(result).to.deep.equal([
                {
                    description: "A crusty loaf of bread.",
                    id: 2,
                    maxCount: 20,
                    name: "bread",
                    type: ITEM_TYPE.FOOD
                },
                {
                    description: "A small vial that restores a bit of health.",
                    id: 1,
                    maxCount: 20,
                    name: "small health potion",
                    type: ITEM_TYPE.POTION
                }
            ]);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [],
                    statement: "SELECT id, name, description, maxCount, type FROM itemDefs ORDER BY name ASC"
                }
            ]);
        });

    });

});
