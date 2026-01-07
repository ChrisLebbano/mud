import { RowDataPacket } from "mysql2";

export interface UserCreateData {
    email: string;
    passwordHash: string;
    username: string;
}

export interface UserLoginPayload {
    password: string;
    username: string;
}

export interface UserRecord {
    email: string;
    id: number;
    passwordHash: string;
    username: string;
}

export interface UserRow extends RowDataPacket {
    email: string;
    id: number;
    password_hash: string;
    username: string;
}

export interface UserSignupPayload {
    email: string;
    password: string;
    username: string;
}
