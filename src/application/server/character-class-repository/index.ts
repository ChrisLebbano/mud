import { type CharacterClassRecord, type CharacterClassRow } from "../types/character-class";
import { type DatabaseConnectionClient } from "../types/database";

export class CharacterClassRepository {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async findAll(): Promise<CharacterClassRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<CharacterClassRow[]>(
            "SELECT id, name, description FROM characterClasses ORDER BY name ASC",
            []
        );

        return rows.map((row) => ({
            description: row.description,
            id: row.id,
            name: row.name
        }));
    }

}

