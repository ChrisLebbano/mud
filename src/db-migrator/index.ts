import { type DatabaseConfig } from "../application/server/types/database";
import { type MigrationPoolFactory } from "../types/db-migrator";
import { createPool } from "mysql2/promise";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

export class DbMigrator {

    private _config: DatabaseConfig;
    private _migrationsPath: string;
    private _poolFactory: MigrationPoolFactory;

    constructor(config: DatabaseConfig, poolFactory: MigrationPoolFactory, migrationsPath: string) {
        this._config = config;
        this._migrationsPath = migrationsPath;
        this._poolFactory = poolFactory;
    }

    public async migrate(): Promise<number> {
        const pool = this._poolFactory(this._config);
        let appliedCount = 0;

        try {
            await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY unique_schema_migrations_name (name)
            )`);

            const schemaMigrationsResults = await pool.query("SELECT name FROM schema_migrations");
            const rows = schemaMigrationsResults[0];
            const appliedNames = new Set((rows as Array<{ name: string }>).map((row) => row.name));
            const migrationFiles = (await readdir(this._migrationsPath))
                .filter((file) => file.endsWith(".sql"))
                .sort();

            for (const file of migrationFiles) {
                if (appliedNames.has(file)) {
                    continue;
                }

                const migrationPath = resolve(this._migrationsPath, file);
                const sql = await readFile(migrationPath, "utf8");
                const connection = await pool.getConnection();

                try {
                    await connection.beginTransaction();
                    await connection.query(sql);
                    await connection.query("INSERT INTO schema_migrations (name) VALUES (?)", [file]);
                    await connection.commit();
                    appliedCount += 1;
                } catch (error) {
                    await connection.rollback();
                    throw error;
                } finally {
                    connection.release();
                }
            }
        } finally {
            await pool.end();
        }

        return appliedCount;
    }

}

const runMigrations = async (): Promise<void> => {
    loadEnvFile('.env');

    const databaseConfig: DatabaseConfig = {
        database: process.env.MYSQL_DATABASE || "mud",
        host: process.env.MYSQL_HOST || "127.0.0.1",
        password: process.env.MYSQL_PASSWORD || "mud_password",
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        user: process.env.MYSQL_USER || "mud_user"
    };

    const migrationsPath = resolve(process.cwd(), "migrations");
    const migrator = new DbMigrator(databaseConfig, createPool, migrationsPath);
    const appliedCount = await migrator.migrate();

    console.log(`[INFO] Applied ${appliedCount} migration(s).`);
};

if (require.main === module) {
    runMigrations().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] Migration failed: ${message}`);
        process.exitCode = 1;
    });
}
