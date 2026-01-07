import { sign } from "jsonwebtoken";

export class TokenService {

    private _tokenSecret: string;

    constructor(tokenSecret: string) {
        this._tokenSecret = tokenSecret;
    }

    public createToken(username: string, playerCharacterNames: string[]): string {
        return sign({ playerCharacterNames, username }, this._tokenSecret, { expiresIn: "1h" });
    }

}

