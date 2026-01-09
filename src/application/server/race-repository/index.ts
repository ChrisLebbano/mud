import { type DatabaseConnectionClient } from "../types/database";
import { type RaceRecord, type RaceRow } from "../types/race";

export class RaceRepository {

    private _databaseConnection: DatabaseConnectionClient;

    constructor(databaseConnection: DatabaseConnectionClient) {
        this._databaseConnection = databaseConnection;
    }

    public async findAll(): Promise<RaceRecord[]> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<RaceRow[]>(
            "SELECT id, race_key, name, description, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana FROM races ORDER BY name ASC",
            []
        );

        return rows.map((row) => ({
            baseAttributes: {
                agility: row.agility,
                charisma: row.charisma,
                constitution: row.constitution,
                dexterity: row.dexterity,
                health: row.health,
                intelligence: row.intelligence,
                mana: row.mana,
                perception: row.perception,
                resolve: row.resolve,
                strength: row.strength,
                wisdom: row.wisdom
            },
            description: row.description,
            id: row.id,
            name: row.name,
            raceKey: row.race_key
        }));
    }

}
