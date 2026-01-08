import { RowDataPacket } from "mysql2";

export interface CharacterClassRecord {
    description: string | null;
    id: number;
    name: string;
}

export interface CharacterClassRow extends RowDataPacket {
    description: string | null;
    id: number;
    name: string;
}

