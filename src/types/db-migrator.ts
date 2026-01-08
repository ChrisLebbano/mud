import { type DatabaseConfig } from "../server/types/database";
import { type PoolConnection } from "mysql2/promise";

export interface MigrationConnection {
    beginTransaction: () => Promise<void>;
    commit: () => Promise<void>;
    query: (sql: string, values?: unknown[]) => Promise<unknown>;
    release: () => void;
    rollback: () => Promise<void>;
}

export interface MigrationPool {
    end: () => Promise<void>;
    getConnection: () => Promise<MigrationConnection | PoolConnection>;
    query: (sql: string, values?: unknown[]) => Promise<unknown>;
}

export type MigrationPoolFactory = (config: DatabaseConfig) => MigrationPool;

