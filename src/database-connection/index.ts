import { type DatabaseConfig, type DatabasePoolFactory } from "../types";

export class DatabaseConnection {

    private _config: DatabaseConfig;
    private _pool?: ReturnType<DatabasePoolFactory>;
    private _poolFactory: DatabasePoolFactory;

    constructor(config: DatabaseConfig, poolFactory: DatabasePoolFactory) {
        this._config = config;
        this._poolFactory = poolFactory;
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

}
