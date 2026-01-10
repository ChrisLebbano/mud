import { type DatabaseConnectionClient } from "../types/database";
import { type NonPlayerCharacterRecord, type NonPlayerCharacterRow } from "../types/non-player-character";

export class NonPlayerCharacterRepository {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async findAll(): Promise<NonPlayerCharacterRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<NonPlayerCharacterRow[]>(
            "SELECT id, name, room_id, class_id, race_key, hail_response, max_health FROM nonPlayerCharacters ORDER BY name ASC",
            []
        );

        return rows.map((row) => ({
            classId: row.class_id.toString(),
            hailResponse: row.hail_response,
            id: row.id,
            maxHealth: row.max_health,
            name: row.name,
            raceId: row.race_key,
            roomId: row.room_id
        }));
    }

}

