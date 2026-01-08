import { DbMigrator } from "../../src/db-migrator";
import { type DatabaseConfig } from "../../src/application/server/types/database";
import { type MigrationPool, type MigrationPoolFactory } from "../../src/types/db-migrator";
import { expect } from "chai";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

class FakeConnection {

    private _queries: string[] = [];
    private _released = false;

    public beginTransaction(): Promise<void> {
        return Promise.resolve();
    }

    public commit(): Promise<void> {
        return Promise.resolve();
    }

    public get queries(): string[] {
        return this._queries;
    }

    public query(sql: string): Promise<unknown> {
        this._queries.push(sql);
        return Promise.resolve([]);
    }

    public release(): void {
        this._released = true;
    }

    public get released(): boolean {
        return this._released;
    }

    public rollback(): Promise<void> {
        return Promise.resolve();
    }

}

class FakePool implements MigrationPool {

    private _connections: FakeConnection[] = [];
    private _queries: string[] = [];
    private _rows: Array<{ name: string }> = [];

    constructor(rows: Array<{ name: string }>) {
        this._rows = rows;
    }

    public get connections(): FakeConnection[] {
        return this._connections;
    }

    public end(): Promise<void> {
        return Promise.resolve();
    }

    public getConnection(): Promise<FakeConnection> {
        const connection = new FakeConnection();
        this._connections.push(connection);
        return Promise.resolve(connection);
    }

    public query(sql: string): Promise<[Array<{ name: string }>, unknown[]]> {
        this._queries.push(sql);

        if (sql.startsWith("SELECT name FROM schema_migrations")) {
            return Promise.resolve([this._rows, []]);
        }

        return Promise.resolve([[], []]);
    }

    public get queries(): string[] {
        return this._queries;
    }

}

describe(`[Class] DbMigrator`, () => {
    const databaseConfig: DatabaseConfig = {
        database: "mud",
        host: "127.0.0.1",
        password: "mud_password",
        port: 3306,
        user: "mud_user"
    };

    const createMigrationsDir = async (): Promise<string> => {
        const directory = await mkdtemp(join(tmpdir(), "mud-migrations-"));
        await writeFile(join(directory, "2024-08-25-0001-create-users.sql"), "CREATE TABLE users (id INT);");
        await writeFile(join(directory, "2024-08-25-0002-create-characters.sql"), "CREATE TABLE characters (id INT);");
        return directory;
    };

    describe(`[Method] migrate`, () => {

        it(`should apply pending migrations in order`, async () => {
            const migrationsPath = await createMigrationsDir();
            const pool = new FakePool([]);
            const poolFactory: MigrationPoolFactory = () => {
                return pool;
            };

            const migrator = new DbMigrator(databaseConfig, poolFactory, migrationsPath);
            const appliedCount = await migrator.migrate();

            expect(appliedCount).to.equal(2);
            expect(pool.connections).to.have.lengthOf(2);
            expect(pool.connections[0].queries).to.deep.equal([
                "CREATE TABLE users (id INT);",
                "INSERT INTO schema_migrations (name) VALUES (?)"
            ]);
            expect(pool.connections[1].queries).to.deep.equal([
                "CREATE TABLE characters (id INT);",
                "INSERT INTO schema_migrations (name) VALUES (?)"
            ]);
        });

        it(`should skip migrations that are already applied`, async () => {
            const migrationsPath = await createMigrationsDir();
            const pool = new FakePool([{ name: "2024-08-25-0001-create-users.sql" }]);
            const poolFactory: MigrationPoolFactory = () => {
                return pool;
            };

            const migrator = new DbMigrator(databaseConfig, poolFactory, migrationsPath);
            const appliedCount = await migrator.migrate();

            expect(appliedCount).to.equal(1);
            expect(pool.connections).to.have.lengthOf(1);
            expect(pool.connections[0].queries).to.deep.equal([
                "CREATE TABLE characters (id INT);",
                "INSERT INTO schema_migrations (name) VALUES (?)"
            ]);
        });

    });

});
