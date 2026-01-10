import { expect } from "chai";
import { type DatabaseConnectionClient, type DatabasePoolFactory } from "../../../../src/application/server/types/database";
import { UserRepository } from "../../../../src/application/server/user-repository";

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

describe(`[Class] UserRepository`, () => {

    describe(`[Method] clearLoginToken`, () => {

        it(`should clear the login token`, async () => {
            const pool = new FakePool();
            pool.queueResult({ affectedRows: 1 });
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            await repository.clearLoginToken(27);

            expect(pool.executeCalls).to.deep.equal([
                {
                    params: [27],
                    statement: "UPDATE users SET loginToken = NULL WHERE id = ?"
                }
            ]);
        });

    });

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
                isAdmin: false,
                lastLoginOn: null,
                loginToken: null,
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
                    is_admin: 0,
                    lastLoginOn: null,
                    loginToken: "token-123",
                    password_hash: "hash",
                    username: "hero"
                }
            ]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByEmail("user@example.com");

            expect(result).to.deep.equal({
                email: "user@example.com",
                id: 44,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-123",
                passwordHash: "hash",
                username: "hero"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["user@example.com"],
                    statement: "SELECT id, username, email, password_hash, loginToken, lastLoginOn, is_admin FROM users WHERE email = ? LIMIT 1"
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

    describe(`[Method] findByLoginToken`, () => {

        it(`should return a user when found`, async () => {
            const pool = new FakePool();
            pool.queueResult([
                {
                    email: "user@example.com",
                    id: 90,
                    is_admin: 1,
                    lastLoginOn: null,
                    loginToken: "token-456",
                    password_hash: "hash",
                    username: "hero"
                }
            ]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByLoginToken("token-456");

            expect(result).to.deep.equal({
                email: "user@example.com",
                id: 90,
                isAdmin: true,
                lastLoginOn: null,
                loginToken: "token-456",
                passwordHash: "hash",
                username: "hero"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["token-456"],
                    statement: "SELECT id, username, email, password_hash, loginToken, lastLoginOn, is_admin FROM users WHERE loginToken = ? LIMIT 1"
                }
            ]);
        });

        it(`should return null when no token matches`, async () => {
            const pool = new FakePool();
            pool.queueResult([]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByLoginToken("missing");

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
                    is_admin: 0,
                    lastLoginOn: null,
                    loginToken: "token-456",
                    password_hash: "hash",
                    username: "hero"
                }
            ]);
            const repository = new UserRepository(new FakeDatabaseConnection(pool));

            const result = await repository.findByUsername("hero");

            expect(result).to.deep.equal({
                email: "user@example.com",
                id: 55,
                isAdmin: false,
                lastLoginOn: null,
                loginToken: "token-456",
                passwordHash: "hash",
                username: "hero"
            });
            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["hero"],
                    statement: "SELECT id, username, email, password_hash, loginToken, lastLoginOn, is_admin FROM users WHERE username = ? LIMIT 1"
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

    describe(`[Method] updateLoginToken`, () => {

        it(`should update the login token and timestamp`, async () => {
            const pool = new FakePool();
            pool.queueResult({ affectedRows: 1 });
            const repository = new UserRepository(new FakeDatabaseConnection(pool));
            const lastLoginOn = new Date("2024-08-30T10:00:00Z");

            await repository.updateLoginToken(12, "token-999", lastLoginOn);

            expect(pool.executeCalls).to.deep.equal([
                {
                    params: ["token-999", lastLoginOn, 12],
                    statement: "UPDATE users SET loginToken = ?, lastLoginOn = ? WHERE id = ?"
                }
            ]);
        });

    });

});

