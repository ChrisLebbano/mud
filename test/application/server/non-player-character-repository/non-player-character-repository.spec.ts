import { NonPlayerCharacterRepository } from "../../../../src/application/server/non-player-character-repository";
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

describe(`[Class] NonPlayerCharacterRepository`, () => {

    describe(`[Method] findAll`, () => {

        it(`should return non-player characters ordered by name`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    class_id: 2,
                    hail_response: "Greetings.",
                    id: "npc-guide",
                    max_health: null,
                    name: "Terminal Guide",
                    race_key: "human",
                    room_id: "atrium"
                },
                {
                    class_id: 1,
                    hail_response: null,
                    id: "npc-rat",
                    max_health: 20,
                    name: "a rat",
                    race_key: "creature",
                    room_id: "training-grounds"
                }
            ]);
            const repository = new NonPlayerCharacterRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findAll();

            expect(result).to.deep.equal([
                {
                    classId: "2",
                    hailResponse: "Greetings.",
                    id: "npc-guide",
                    maxHealth: null,
                    name: "Terminal Guide",
                    raceId: "human",
                    roomId: "atrium"
                },
                {
                    classId: "1",
                    hailResponse: null,
                    id: "npc-rat",
                    maxHealth: 20,
                    name: "a rat",
                    raceId: "creature",
                    roomId: "training-grounds"
                }
            ]);
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [],
                    statement: "SELECT id, name, room_id, class_id, race_key, hail_response, max_health FROM nonPlayerCharacters ORDER BY name ASC"
                }
            ]);
        });

    });

});

