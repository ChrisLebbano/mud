import { RowDataPacket } from "mysql2";

export interface NonPlayerCharacterRecord {
    classId: string;
    hailResponse: string | null;
    id: string;
    maxHealth: number | null;
    name: string;
    raceId: string;
    roomId: string;
}

export interface NonPlayerCharacterRow extends RowDataPacket {
    class_id: number;
    hail_response: string | null;
    id: string;
    max_health: number | null;
    name: string;
    race_key: string;
    room_id: string;
}

