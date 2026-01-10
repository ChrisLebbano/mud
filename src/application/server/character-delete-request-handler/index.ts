import { type CharacterRepository } from "../character-repository";
import { JsonBodyParser } from "../json-body-parser";
import { type CharacterDeletePayload } from "../types/character";
import { type UserRepository } from "../user-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class CharacterDeleteRequestHandler {

    private _characterRepository: CharacterRepository;
    private _userRepository: UserRepository;

    constructor(characterRepository: CharacterRepository, userRepository: UserRepository) {
        this._characterRepository = characterRepository;
        this._userRepository = userRepository;
    }

    public handle(request: IncomingMessage, response: ServerResponse): void {
        const sendJson = (statusCode: number, payload: Record<string, string>): void => {
            response.statusCode = statusCode;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(payload));
        };

        if (request.method !== "DELETE") {
            sendJson(405, { error: "Method not allowed." });
            return;
        }

        const run = async (): Promise<void> => {
            let payload: CharacterDeletePayload;

            try {
                payload = await JsonBodyParser.parse<CharacterDeletePayload>(request);
            } catch (error) {
                sendJson(400, { error: "Invalid JSON body." });
                return;
            }

            if (!payload || typeof payload !== "object") {
                sendJson(400, { error: "Login token and character id are required." });
                return;
            }

            const loginToken = typeof payload.loginToken === "string" ? payload.loginToken.trim() : "";
            const characterId = typeof payload.characterId === "number" ? payload.characterId : Number.NaN;

            if (!loginToken || Number.isNaN(characterId)) {
                sendJson(400, { error: "Login token and character id are required." });
                return;
            }

            const user = await this._userRepository.findByLoginToken(loginToken);
            if (!user) {
                sendJson(401, { error: "Authentication required." });
                return;
            }

            const deleted = await this._characterRepository.markDeletedById(characterId, user.id);

            if (!deleted) {
                sendJson(404, { error: "Character not found." });
                return;
            }

            sendJson(200, { message: "Character deleted." });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Character deletion failed: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}
