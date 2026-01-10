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
    isAdmin: boolean;
    lastLoginOn: Date | null;
    loginToken: string | null;
    passwordHash: string;
    username: string;
}

export interface UserRow extends RowDataPacket {
    email: string;
    id: number;
    is_admin: number;
    lastLoginOn: Date | null;
    loginToken: string | null;
    password_hash: string;
    username: string;
}

export interface UserSignupPayload {
    email: string;
    password: string;
    username: string;
}

