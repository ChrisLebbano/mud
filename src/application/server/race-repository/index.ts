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
            "SELECT id, race_key, name, description, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana, base_health, player_character_allowed FROM races ORDER BY name ASC",
            []
        );

        return rows.map((row) => this.mapRowToRecord(row));
    }

    public async findByName(name: string): Promise<RaceRecord | null> {
        const pool = this._databaseConnection.connect();
        const [rows] = await pool.execute<RaceRow[]>(
            "SELECT id, race_key, name, description, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana, base_health, player_character_allowed FROM races WHERE LOWER(name) = LOWER(?) LIMIT 1",
            [name]
        );

        if (rows.length === 0) {
            return null;
        }

        return this.mapRowToRecord(rows[0]);
    }

    private mapRowToRecord(row: RaceRow): RaceRecord {
        return {
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
            baseHealth: row.base_health,
            description: row.description,
            id: row.id,
            name: row.name,
            playerCharacterAllowed: row.player_character_allowed === 1,
            raceKey: row.race_key
        };
    }

}

