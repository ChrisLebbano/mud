import { type DatabaseConnectionClient } from "../types/database";
import { type RaceRecord, type RaceRow } from "../types/race";
import { type RaceRepositoryClient } from "../types/race-repository";

export class RaceRepository implements RaceRepositoryClient {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async findAll(): Promise<RaceRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<RaceRow[]>(
            "SELECT id, name, description FROM races ORDER BY name ASC",
            []
        );

        return rows.map((row) => ({
            description: row.description,
            id: String(row.id),
            name: row.name
        }));
    }

}
