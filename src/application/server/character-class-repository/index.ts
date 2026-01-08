import { type CharacterClassRecord, type CharacterClassRow } from "../types/character-class";
import { type CharacterClassRepositoryClient } from "../types/character-class-repository";
import { type DatabaseConnectionClient } from "../types/database";

export class CharacterClassRepository implements CharacterClassRepositoryClient {

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
            id: String(row.id),
            name: row.name
        }));
    }

}
