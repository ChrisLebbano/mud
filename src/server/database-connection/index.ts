import { type DatabaseConfig, type DatabasePoolFactory } from "../../types";

export class DatabaseConnection {

    private _config: DatabaseConfig;
    private _pool?: ReturnType<DatabasePoolFactory>;
    private _poolFactory: DatabasePoolFactory;
    private _testTableName: string;

    constructor(config: DatabaseConfig, poolFactory: DatabasePoolFactory, testTableName: string) {
        this._config = config;
        this._poolFactory = poolFactory;
        this._testTableName = testTableName;
    }

    public connect(): ReturnType<DatabasePoolFactory> {
        if (!this._pool) {
            this._pool = this._poolFactory(this._config);
        }

        return this._pool;
    }

    public async disconnect(): Promise<void> {
        if (!this._pool) {
            return;
        }

        await this._pool.end();
        this._pool = undefined;
    }

    public get pool(): ReturnType<DatabasePoolFactory> | undefined {
        return this._pool;
    }

    public async testConnection(stage: string): Promise<void> {
        const pool = this.connect();

        try {
            await pool.query(`SELECT 1 FROM \`${this._testTableName}\` LIMIT 1`);
            console.log(`[INFO] Database connection test (${stage}) succeeded.`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Database connection test (${stage}) failed: ${message}`);
        }
    }

}
