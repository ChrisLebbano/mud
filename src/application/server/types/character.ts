import { RowDataPacket } from "mysql2";

export interface CharacterCreateData {
    className: string;
    name: string;
    raceName: string;
    userId: number;
}


export interface CharacterCreatePayload {
    characterClassName: string;
    characterName: string;
    characterRaceName: string;
    loginToken: string;
}

export interface CharacterDeletePayload {
    characterId: number;
    loginToken: string;
}

export interface CharacterNameValidationResult {
    error: string | null;
    formattedName: string;
    isValid: boolean;
}

export interface CharacterRecord {
    className: string;
    id: number;
    name: string;
    raceName: string;
    userId: number;
}

export interface CharacterRow extends RowDataPacket {
    class_name: string;
    id: number;
    name: string;
    race_name: string;
    user_id: number;
}
