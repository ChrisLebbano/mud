import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export class PasswordHasher {

    public async hashPassword(password: string): Promise<string> {
        const salt = randomBytes(16);
        const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
        return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
    }

    public async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
        const segments = passwordHash.split("$");
        if (segments.length !== 3 || segments[0] !== "scrypt") {
            return false;
        }

        const saltHex = segments[1];
        const storedHashHex = segments[2];

        if (!saltHex || !storedHashHex) {
            return false;
        }

        const salt = Buffer.from(saltHex, "hex");
        const storedHash = Buffer.from(storedHashHex, "hex");
        const derivedKey = await scryptAsync(password, salt, 64) as Buffer;

        if (storedHash.length !== derivedKey.length) {
            return false;
        }

        return timingSafeEqual(derivedKey, storedHash);
    }

}
