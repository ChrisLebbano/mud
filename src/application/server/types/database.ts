import { type Pool } from "mysql2/promise";

export interface DatabaseConfig {
    database: string;
    host: string;
    password: string;
    port: number;
    user: string;
}

export type DatabasePoolFactory = (config: DatabaseConfig) => Pool;

export interface DatabaseConnectionClient {
    connect: () => ReturnType<DatabasePoolFactory>;
    testConnection: (stage: string) => Promise<boolean>;
}
