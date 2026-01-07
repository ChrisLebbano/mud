import { PasswordService } from "../password-service";
import { TokenService } from "../token-service";
import { type UserAuthenticationResult } from "../types";
import { UserRepository } from "../user-repository";

export class UserAuthenticationService {

    private _passwordService: PasswordService;
    private _tokenService: TokenService;
    private _userRepository: UserRepository;

    constructor(passwordService: PasswordService, tokenService: TokenService, userRepository: UserRepository) {
        this._passwordService = passwordService;
        this._tokenService = tokenService;
        this._userRepository = userRepository;
    }

    public async loginUser(username: string, password: string): Promise<UserAuthenticationResult | null> {
        const trimmedUsername = username.trim();
        const userRecord = await this._userRepository.findUserByUsername(trimmedUsername);
        if (!userRecord) {
            return null;
        }

        const isValidPassword = await this._passwordService.verifyPassword(password, userRecord.passwordHash);
        if (!isValidPassword) {
            return null;
        }

        const playerCharacterNames = await this._userRepository.listCharacterNamesByUserId(userRecord.id);
        const authToken = this._tokenService.createToken(userRecord.username, playerCharacterNames);

        return {
            authToken,
            playerCharacterNames,
            username: userRecord.username
        };
    }

    public async signupUser(username: string, password: string): Promise<UserAuthenticationResult | null> {
        const trimmedUsername = username.trim();
        const existingUser = await this._userRepository.findUserByUsername(trimmedUsername);
        if (existingUser) {
            return null;
        }

        const passwordHash = await this._passwordService.hashPassword(password);
        const userRecord = await this._userRepository.createUser(trimmedUsername, passwordHash);
        const playerCharacterNames: string[] = [];
        const authToken = this._tokenService.createToken(userRecord.username, playerCharacterNames);

        return {
            authToken,
            playerCharacterNames,
            username: userRecord.username
        };
    }

}
