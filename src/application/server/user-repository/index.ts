import { type DatabaseConnectionClient } from "../types/database";
import { type UserCreateData, type UserRecord, type UserRow } from "../types/user";
import { type ResultSetHeader } from "mysql2/promise";

export class UserRepository {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async createUser(userData: UserCreateData): Promise<UserRecord> {
        const pool = this._databaseConnection.connect();
        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
            [userData.username, userData.email, userData.passwordHash]
        );

        return {
            email: userData.email,
            id: result.insertId,
            lastLoginOn: null,
            loginToken: null,
            passwordHash: userData.passwordHash,
            username: userData.username
        };
    }

    public async findByEmail(email: string): Promise<UserRecord | null> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<UserRow[]>(
            "SELECT id, username, email, password_hash, loginToken, lastLoginOn FROM users WHERE email = ? LIMIT 1",
            [email]
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            email: row.email,
            id: row.id,
            lastLoginOn: row.lastLoginOn,
            loginToken: row.loginToken,
            passwordHash: row.password_hash,
            username: row.username
        };
    }

    public async findByLoginToken(loginToken: string): Promise<UserRecord | null> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<UserRow[]>(
            "SELECT id, username, email, password_hash, loginToken, lastLoginOn FROM users WHERE loginToken = ? LIMIT 1",
            [loginToken]
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            email: row.email,
            id: row.id,
            lastLoginOn: row.lastLoginOn,
            loginToken: row.loginToken,
            passwordHash: row.password_hash,
            username: row.username
        };
    }

    public async findByUsername(username: string): Promise<UserRecord | null> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<UserRow[]>(
            "SELECT id, username, email, password_hash, loginToken, lastLoginOn FROM users WHERE username = ? LIMIT 1",
            [username]
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            email: row.email,
            id: row.id,
            lastLoginOn: row.lastLoginOn,
            loginToken: row.loginToken,
            passwordHash: row.password_hash,
            username: row.username
        };
    }

    public async updateLoginToken(userId: number, loginToken: string, lastLoginOn: Date): Promise<void> {
        const pool = this._databaseConnection.connect();
        await pool.execute<ResultSetHeader>(
            "UPDATE users SET loginToken = ?, lastLoginOn = ? WHERE id = ?",
            [loginToken, lastLoginOn, userId]
        );
    }

}
