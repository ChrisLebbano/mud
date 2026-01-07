import { type DatabaseConfig, type UserRecord } from "../types";
import { type ResultSetHeader, type RowDataPacket } from "mysql2";
import { createPool, type Pool } from "mysql2/promise";

export class UserRepository {

    private _pool: Pool;

    constructor(databaseConfig: DatabaseConfig, pool?: Pool) {
        this._pool = pool ? pool : createPool({
            database: databaseConfig.database,
            host: databaseConfig.host,
            password: databaseConfig.password,
            port: databaseConfig.port,
            user: databaseConfig.user
        });
    }

    public async createUser(username: string, passwordHash: string): Promise<UserRecord> {
        const [result] = await this._pool.execute<ResultSetHeader>(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            [username, passwordHash]
        );

        return {
            id: result.insertId,
            passwordHash,
            username
        };
    }

    public async findUserByUsername(username: string): Promise<UserRecord | null> {
        const [rows] = await this._pool.execute<RowDataPacket[]>(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            [username]
        );
        const row = rows[0] as { id: number; password_hash: string; username: string } | undefined;
        if (!row) {
            return null;
        }

        return {
            id: row.id,
            passwordHash: row.password_hash,
            username: row.username
        };
    }

    public async listCharacterNamesByUserId(userId: number): Promise<string[]> {
        const [rows] = await this._pool.execute<RowDataPacket[]>(
            "SELECT name FROM characters WHERE user_id = ?",
            [userId]
        );

        return rows.map((row) => row.name as string);
    }

}
