import { type CharacterRepository } from "../character-repository";
import { type UserRepository } from "../user-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class AdminCharacterListRequestHandler {

    private _characterRepository: CharacterRepository;
    private _userRepository: UserRepository;

    constructor(characterRepository: CharacterRepository, userRepository: UserRepository) {
        this._characterRepository = characterRepository;
        this._userRepository = userRepository;
    }

    public handle(request: IncomingMessage, response: ServerResponse): void {
        const sendJson = (statusCode: number, payload: Record<string, unknown>): void => {
            response.statusCode = statusCode;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(payload));
        };

        if (request.method !== "GET") {
            sendJson(405, { error: "Method not allowed." });
            return;
        }

        const run = async (): Promise<void> => {
            const requestUrl = new URL(request.url ?? "", "http://localhost");
            const loginToken = requestUrl.searchParams.get("loginToken")?.trim() ?? "";

            if (!loginToken) {
                sendJson(401, { error: "Authentication required." });
                return;
            }

            const user = await this._userRepository.findByLoginToken(loginToken);
            if (!user) {
                sendJson(401, { error: "Authentication required." });
                return;
            }

            if (!user.isAdmin) {
                sendJson(403, { error: "Admin access required." });
                return;
            }

            const characters = await this._characterRepository.findAllWithUsers();

            sendJson(200, {
                characters: characters.map((character) => ({
                    className: character.className,
                    id: character.id,
                    name: character.name,
                    raceName: character.raceName,
                    userId: character.userId,
                    username: character.username
                }))
            });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Admin character list retrieval failed: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}


