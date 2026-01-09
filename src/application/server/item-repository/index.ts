import { type DatabaseConnectionClient } from "../types/database";
import { type ItemRecord, type ItemRow } from "../types/item";

export class ItemRepository {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async findAll(): Promise<ItemRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<ItemRow[]>(
            "SELECT id, name, description, maxCount, type FROM items ORDER BY name ASC",
            []
        );

        return rows.map((row) => ({
            description: row.description,
            id: row.id,
            maxCount: row.maxCount,
            name: row.name,
            type: row.type
        }));
    }

}

