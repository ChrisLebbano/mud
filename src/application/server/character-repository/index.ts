import { type CharacterCreateData, type CharacterRecord, type CharacterRow } from "../types/character";
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

    public async findByName(name: string): Promise<CharacterRecord | null> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<CharacterRow[]>(
            "SELECT id, name, user_id, race_name, class_name FROM playerCharacters WHERE name = ? LIMIT 1",
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
            "SELECT id, name, user_id, race_name, class_name FROM playerCharacters WHERE user_id = ? ORDER BY name ASC",
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

}
