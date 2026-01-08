import { type CharacterClassRepository } from "../character-class-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class CharacterClassListRequestHandler {

    private _characterClassRepository: CharacterClassRepository;

    constructor(characterClassRepository: CharacterClassRepository) {
        this._characterClassRepository = characterClassRepository;
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
            const classes = await this._characterClassRepository.findAll();
            sendJson(200, {
                classes: classes.map((characterClass) => ({
                    description: characterClass.description,
                    id: characterClass.id,
                    name: characterClass.name
                }))
            });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Failed to load classes: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}

