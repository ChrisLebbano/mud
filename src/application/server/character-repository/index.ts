import {
    type AdminCharacterRecord,
    type AdminCharacterRow,
    type CharacterCreateData,
    type CharacterRecord,
    type CharacterRow
} from "../types/character";
import { type DatabaseConnectionClient } from "../types/database";
import { type ResultSetHeader } from "mysql2/promise";

export class CharacterRepository {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async createCharacter(characterData: CharacterCreateData): Promise<CharacterRecord> {
        const pool = this._databaseConnection.connect();
        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO playerCharacters (name, user_id, race_name, class_name) VALUES (?, ?, ?, ?)",
            [characterData.name, characterData.userId, characterData.raceName, characterData.className]
        );

        return {
            className: characterData.className,
            id: result.insertId,
            name: characterData.name,
            raceName: characterData.raceName,
            userId: characterData.userId
        };
    }

    public async findAllWithUsers(): Promise<AdminCharacterRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<AdminCharacterRow[]>(
            `SELECT playerCharacters.id, playerCharacters.name, playerCharacters.user_id, playerCharacters.race_name, playerCharacters.class_name, users.username
            FROM playerCharacters
            JOIN users ON users.id = playerCharacters.user_id
            WHERE playerCharacters.deleted_at IS NULL
            ORDER BY playerCharacters.name ASC`
        );

        return rows.map((row) => ({
            className: row.class_name,
            id: row.id,
            name: row.name,
            raceName: row.race_name,
            userId: row.user_id,
            username: row.username
        }));
    }

    public async findByName(name: string): Promise<CharacterRecord | null> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<CharacterRow[]>(
            "SELECT id, name, user_id, race_name, class_name FROM playerCharacters WHERE name = ? AND deleted_at IS NULL LIMIT 1",
            [name]
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            className: row.class_name,
            id: row.id,
            name: row.name,
            raceName: row.race_name,
            userId: row.user_id
        };
    }

    public async findByUserId(userId: number): Promise<CharacterRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<CharacterRow[]>(
            "SELECT id, name, user_id, race_name, class_name FROM playerCharacters WHERE user_id = ? AND deleted_at IS NULL ORDER BY name ASC",
            [userId]
        );

        return rows.map((row) => ({
            className: row.class_name,
            id: row.id,
            name: row.name,
            raceName: row.race_name,
            userId: row.user_id
        }));
    }

    public async markDeletedById(characterId: number, userId: number): Promise<boolean> {
        const pool = this._databaseConnection.connect();
        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE playerCharacters SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
            [characterId, userId]
        );

        return result.affectedRows > 0;
    }

    public async markDeletedByIdForAdmin(characterId: number): Promise<boolean> {
        const pool = this._databaseConnection.connect();
        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE playerCharacters SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
            [characterId]
        );

        return result.affectedRows > 0;
    }

}

