import { type CharacterAttributeValues } from "../../../game/types/character-attributes";
import { RowDataPacket } from "mysql2";

export interface CharacterClassRecord {
    attributeModifiers: CharacterAttributeValues;
    description: string | null;
    id: number;
    name: string;
}

export interface CharacterClassRow extends RowDataPacket {
    attributeModifiers: CharacterAttributeValues | string;
    description: string | null;
    id: number;
    name: string;
}

