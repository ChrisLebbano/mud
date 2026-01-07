import { expect } from "chai";
import { DatabaseConnection } from "../../src/database-connection";
import { type DatabaseConfig, type DatabasePoolFactory } from "../../src/types";

class FakePool {

    private _endCalled = false;

    public end(): Promise<void> {
        this._endCalled = true;
        return Promise.resolve();
    }

    public get endCalled(): boolean {
        return this._endCalled;
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

    describe(`[Method] connect`, () => {

        it(`should create a pool once and return it`, () => {
            const fakePool = new FakePool();
            let createCalls = 0;
            const poolFactory: DatabasePoolFactory = () => {
                createCalls += 1;
                return fakePool as unknown as ReturnType<DatabasePoolFactory>;
            };

            const connection = new DatabaseConnection(databaseConfig, poolFactory);

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

            const connection = new DatabaseConnection(databaseConfig, poolFactory);

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

            const connection = new DatabaseConnection(databaseConfig, poolFactory);

            expect(connection.pool).to.be.undefined;

            connection.connect();

            expect(connection.pool).to.equal(fakePool as unknown as ReturnType<DatabasePoolFactory>);
        });

    });

});
