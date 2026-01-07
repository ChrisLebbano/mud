import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export class PasswordHasher {

    public async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16);
        const derivedKey = await scryptAsync(password, salt, 64, { N: 16384, p: 1, r: 8 }) as Buffer;
        return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
    }

}

