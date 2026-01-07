import { type JsonBodyParser } from "../json-body-parser";
import { type PasswordHasher } from "../password-hasher";
import { type UserCreateData, type UserSignupPayload } from "../types/user";
import { type UserRepository } from "../user-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class SignupRequestHandler {

    private _jsonBodyParser: JsonBodyParser;
    private _passwordHasher: PasswordHasher;
    private _userRepository: UserRepository;

    constructor(jsonBodyParser: JsonBodyParser, passwordHasher: PasswordHasher, userRepository: UserRepository) {
        this._jsonBodyParser = jsonBodyParser;
        this._passwordHasher = passwordHasher;
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
            let payload: UserSignupPayload;

            try {
                payload = await this._jsonBodyParser.parse<UserSignupPayload>(request);
            } catch (error) {
                sendJson(400, { error: "Invalid JSON body." });
                return;
            }

            if (!payload || typeof payload !== "object") {
                sendJson(400, { error: "Username, email, and password are required." });
                return;
            }

            const username = typeof payload.username === "string" ? payload.username.trim() : "";
            const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
            const password = typeof payload.password === "string" ? payload.password : "";

            if (!username || !email || !password) {
                sendJson(400, { error: "Username, email, and password are required." });
                return;
            }

            const existingUsername = await this._userRepository.findByUsername(username);
            if (existingUsername) {
                sendJson(409, { warning: "Username already exists. Please select a new username." });
                return;
            }

            const existingEmail = await this._userRepository.findByEmail(email);
            if (existingEmail) {
                sendJson(409, { warning: "Email already used. Please log in." });
                return;
            }

            const passwordHash = await this._passwordHasher.hashPassword(password);
            const userData: UserCreateData = {
                email,
                passwordHash,
                username
            };

            await this._userRepository.createUser(userData);

            sendJson(201, { message: "Signup successful." });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Signup failed: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}
