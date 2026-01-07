import { compare, hash } from "bcryptjs";

export class PasswordService {

    private _authSecret: string;
    private _saltRounds: number;

    constructor(authSecret: string, saltRounds: number) {
        this._authSecret = authSecret;
        this._saltRounds = saltRounds;
    }

    public async hashPassword(password: string): Promise<string> {
        return hash(`${password}${this._authSecret}`, this._saltRounds);
    }

    public async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
        return compare(`${password}${this._authSecret}`, passwordHash);
    }

}

