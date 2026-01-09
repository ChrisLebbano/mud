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
            "SELECT id, name, description, attributeModifiers FROM characterClasses ORDER BY name ASC",
            []
        );

        return rows.map((row) => ({
            attributeModifiers: this.parseAttributeModifiers(row.attributeModifiers),
            description: row.description,
            id: row.id,
            name: row.name
        }));
    }

    private getDefaultAttributeModifiers(): CharacterClassRecord["attributeModifiers"] {
        return {
            agility: 0,
            charisma: 0,
            constitution: 0,
            dexterity: 0,
            health: 0,
            intelligence: 0,
            mana: 0,
            perception: 0,
            resolve: 0,
            strength: 0,
            wisdom: 0
        };
    }

    private parseAttributeModifiers(attributeModifiers: CharacterClassRow["attributeModifiers"]): CharacterClassRecord["attributeModifiers"] {
        if (!attributeModifiers) {
            return this.getDefaultAttributeModifiers();
        }

        if (typeof attributeModifiers === "string") {
            return JSON.parse(attributeModifiers) as CharacterClassRecord["attributeModifiers"];
        }

        return attributeModifiers;
    }

}

