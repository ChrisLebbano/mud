import { JsonBodyParser } from "../json-body-parser";
import { LoginTokenGenerator } from "../login-token-generator";
import { PasswordHasher } from "../password-hasher";
import { type UserLoginPayload } from "../types/user";
import { type UserRepository } from "../user-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class LoginRequestHandler {

    private _loginTokenGenerator: LoginTokenGenerator;
    private _passwordHasher: PasswordHasher;
    private _userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this._loginTokenGenerator = new LoginTokenGenerator();
        this._passwordHasher = new PasswordHasher();
        this._userRepository = userRepository;
    }

    public handle(request: IncomingMessage, response: ServerResponse): void {
        const sendJson = (statusCode: number, payload: Record<string, string>): void => {
            response.statusCode = statusCode;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(payload));
        };

        if (request.method !== "POST") {
            sendJson(405, { error: "Method not allowed." });
            return;
        }

        const run = async (): Promise<void> => {
            let payload: UserLoginPayload;

            try {
                payload = await JsonBodyParser.parse<UserLoginPayload>(request);
            } catch (error) {
                sendJson(400, { error: "Invalid JSON body." });
                return;
            }

            if (!payload || typeof payload !== "object") {
                sendJson(400, { error: "Username and password are required." });
                return;
            }

            const username = typeof payload.username === "string" ? payload.username.trim() : "";
            const password = typeof payload.password === "string" ? payload.password : "";

            if (!username || !password) {
                sendJson(400, { error: "Username and password are required." });
                return;
            }

            const user = await this._userRepository.findByUsername(username);
            if (!user) {
                sendJson(401, { error: "Invalid credentials" });
                return;
            }

            const isValidPassword = await this._passwordHasher.verifyPassword(password, user.passwordHash);
            if (!isValidPassword) {
                sendJson(401, { error: "Invalid credentials" });
                return;
            }

            const loginToken = this._loginTokenGenerator.generate();
            const lastLoginOn = new Date();

            await this._userRepository.updateLoginToken(user.id, loginToken, lastLoginOn);

            sendJson(200, {
                isAdmin: user.isAdmin,
                loginToken,
                message: `Login successful for ${user.username}.`
            });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Login failed: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}

