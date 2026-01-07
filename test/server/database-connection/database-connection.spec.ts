import { DatabaseConnection } from "../../../src/server/database-connection";
import { type DatabaseConfig, type DatabasePoolFactory } from "../../../src/server/types/database";
import { expect } from "chai";

class FakePool {

    private _endCalled = false;
    private _queryCalls: string[] = [];

    public end(): Promise<void> {
        this._endCalled = true;
        return Promise.resolve();
    }

    public get endCalled(): boolean {
        return this._endCalled;
    }

    public get queryCalls(): string[] {
        return this._queryCalls;
    }

    public query(statement: string): Promise<void> {
        this._queryCalls.push(statement);
        return Promise.resolve();
    }

}

describe(`[Class] DatabaseConnection`, () => {
    const databaseConfig: DatabaseConfig = {
        database: "mud",
        host: "127.0.0.1",
        password: "mud_password",
        port: 3306,
        user: "mud_user"
    };
    const testTableName = "users";

    describe(`[Method] connect`, () => {

        it(`should create a pool once and return it`, () => {
            const fakePool = new FakePool();
            let createCalls = 0;
            const poolFactory: DatabasePoolFactory = () => {
                createCalls += 1;
                return fakePool as unknown as ReturnType<DatabasePoolFactory>;
            };

            const connection = new DatabaseConnection(databaseConfig, poolFactory, testTableName);

            const firstPool = connection.connect();
            const secondPool = connection.connect();

            expect(firstPool).to.equal(fakePool as unknown as ReturnType<DatabasePoolFactory>);
            expect(secondPool).to.equal(fakePool as unknown as ReturnType<DatabasePoolFactory>);
            expect(connection.pool).to.equal(fakePool as unknown as ReturnType<DatabasePoolFactory>);
            expect(createCalls).to.equal(1);
        });

    });

    describe(`[Method] disconnect`, () => {

        it(`should end and clear the pool`, async () => {
            const fakePool = new FakePool();
            const poolFactory: DatabasePoolFactory = () => {
                return fakePool as unknown as ReturnType<DatabasePoolFactory>;
            };

            const connection = new DatabaseConnection(databaseConfig, poolFactory, testTableName);

            connection.connect();
            await connection.disconnect();

            expect(fakePool.endCalled).to.equal(true);
            expect(connection.pool).to.be.undefined;
        });

    });

    describe(`[Method] pool`, () => {

        it(`should expose the current pool when connected`, () => {
            const fakePool = new FakePool();
            const poolFactory: DatabasePoolFactory = () => {
                return fakePool as unknown as ReturnType<DatabasePoolFactory>;
            };

            const connection = new DatabaseConnection(databaseConfig, poolFactory, testTableName);

            expect(connection.pool).to.be.undefined;

            connection.connect();

            expect(connection.pool).to.equal(fakePool as unknown as ReturnType<DatabasePoolFactory>);
        });

    });

    describe(`[Method] testConnection`, () => {

        it(`should log success when the query succeeds`, async () => {
            const originalConsoleLog = console.log;
            const logs: string[] = [];
            const fakePool = new FakePool();
            const poolFactory: DatabasePoolFactory = () => {
                return fakePool as unknown as ReturnType<DatabasePoolFactory>;
            };

            console.log = (message?: unknown) => {
                if (message) {
                    logs.push(String(message));
                }
            };

            const connection = new DatabaseConnection(databaseConfig, poolFactory, testTableName);

            await connection.testConnection("startup");

            expect(fakePool.queryCalls).to.deep.equal([`SELECT 1 FROM \`${testTableName}\` LIMIT 1`]);
            expect(logs).to.deep.equal([`[INFO] Database connection test (startup) succeeded.`]);

            console.log = originalConsoleLog;
        });

        it(`should log errors when the query fails`, async () => {
            const originalConsoleError = console.error;
            const errors: string[] = [];
            const poolFactory: DatabasePoolFactory = () => {
                return {
                    query: () => Promise.reject(new Error("boom"))
                } as unknown as ReturnType<DatabasePoolFactory>;
            };

            console.error = (message?: unknown) => {
                if (message) {
                    errors.push(String(message));
                }
            };

            const connection = new DatabaseConnection(databaseConfig, poolFactory, testTableName);

            await connection.testConnection("startup");

            expect(errors).to.deep.equal([`[ERROR] Database connection test (startup) failed: boom`]);

            console.error = originalConsoleError;
        });

    });

});
