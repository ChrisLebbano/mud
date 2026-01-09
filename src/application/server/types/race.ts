import { type CharacterAttributeValues } from "../../../game/types/character-attributes";
import { RowDataPacket } from "mysql2";

export interface RaceRecord {
    baseAttributes: CharacterAttributeValues;
    description: string | null;
    id: number;
    name: string;
    raceKey: string;
}

export interface RaceRow extends RowDataPacket {
    agility: number;
    charisma: number;
    constitution: number;
    description: string | null;
    dexterity: number;
    health: number;
    id: number;
    intelligence: number;
    mana: number;
    name: string;
    perception: number;
    race_key: string;
    resolve: number;
    strength: number;
    wisdom: number;
}
