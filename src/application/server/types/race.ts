import { RowDataPacket } from "mysql2";

export interface RaceRecord {
    description: string | null;
    id: string;
    name: string;
}

export interface RaceRow extends RowDataPacket {
    description: string | null;
    id: number;
    name: string;
}
