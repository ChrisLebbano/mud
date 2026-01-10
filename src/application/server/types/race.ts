import { type CharacterAttributeValues } from "../../../game/types/character-attributes";
import { RowDataPacket } from "mysql2";

export interface RaceRecord {
    baseAttributes: CharacterAttributeValues;
    baseHealth: number;
    description: string | null;
    id: number;
    name: string;
    playerCharacterAllowed: boolean;
    raceKey: string;
}

export interface RaceRow extends RowDataPacket {
    agility: number;
    base_health: number;
    charisma: number;
    constitution: number;
    description: string | null;
    dexterity: number;
    id: number;
    intelligence: number;
    mana: number;
    name: string;
    perception: number;
    player_character_allowed: number;
    race_key: string;
    resolve: number;
    strength: number;
    wisdom: number;
}

