import { type DatabaseConnectionClient, type DatabasePoolFactory } from "../../../src/server/types/database";
import { UserRepository } from "../../../src/server/user-repository";
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

describe(`[Class] UserRepository`, () => {

    describe(`[Method] createUser`, () => {

        it(`should insert a new user`, async () => {
            const pool = new FakePool();
            pool.queueResult({ insertId: 12 });
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const user = await repository.createUser({
                email: "user@example.com",
                passwordHash: "hash",
                username: "hero"
            });

            expect(user).to.deep.equal({
                email: "user@example.com",
                id: 12,
                passwordHash: "hash",
                username: "hero"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["hero", "user@example.com", "hash"],
                    statement: "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
                }
            ]);
        });

    });

    describe(`[Method] findByEmail`, () => {

        it(`should return a user when found`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    email: "user@example.com",
                    id: 44,
                    password_hash: "hash",
                    username: "hero"
                }
            ]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByEmail("user@example.com");

            expect(result).to.deep.equal({
                email: "user@example.com",
                id: 44,
                passwordHash: "hash",
                username: "hero"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["user@example.com"],
                    statement: "SELECT id, username, email, password_hash FROM users WHERE email = ? LIMIT 1"
                }
            ]);
        });

        it(`should return null when no email matches`, async () => {
            const pool = new FakePool();
            pool.queueResult([]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByEmail("missing@example.com");

            expect(result).to.equal(null);
        });

    });

    describe(`[Method] findByUsername`, () => {

        it(`should return a user when found`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    email: "user@example.com",
                    id: 55,
                    password_hash: "hash",
                    username: "hero"
                }
            ]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByUsername("hero");

            expect(result).to.deep.equal({
                email: "user@example.com",
                id: 55,
                passwordHash: "hash",
                username: "hero"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["hero"],
                    statement: "SELECT id, username, email, password_hash FROM users WHERE username = ? LIMIT 1"
                }
            ]);
        });

        it(`should return null when no username matches`, async () => {
            const pool = new FakePool();
            pool.queueResult([]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByUsername("missing");

            expect(result).to.equal(null);
        });

    });

});
