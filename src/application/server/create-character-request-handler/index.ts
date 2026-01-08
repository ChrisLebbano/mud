import { type CharacterNameValidator } from "../character-name-validator";
import { type CharacterRepository } from "../character-repository";
import { type JsonBodyParser } from "../json-body-parser";
import { type CharacterCreateData, type CharacterCreatePayload } from "../types/character";
import { type UserRepository } from "../user-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class CreateCharacterRequestHandler {

    private _characterNameValidator: CharacterNameValidator;
    private _characterRepository: CharacterRepository;
    private _jsonBodyParser: JsonBodyParser;
    private _userRepository: UserRepository;

    constructor(jsonBodyParser: JsonBodyParser, characterNameValidator: CharacterNameValidator, characterRepository: CharacterRepository, userRepository: UserRepository) {
        this._characterNameValidator = characterNameValidator;
        this._characterRepository = characterRepository;
        this._jsonBodyParser = jsonBodyParser;
        this._userRepository = userRepository;
    }

    public handle(request: IncomingMessage, response: ServerResponse): void {
        const sendJson = (statusCode: number, payload: Record<string, string | number | Record<string, string | number>>): void => {
            response.statusCode = statusCode;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(payload));
        };

        if (request.method !== "POST") {
            sendJson(405, { error: "Method not allowed." });
            return;
        }

        const run = async (): Promise<void> => {
            let payload: CharacterCreatePayload;

            try {
                payload = await this._jsonBodyParser.parse<CharacterCreatePayload>(request);
            } catch (error) {
                sendJson(400, { error: "Invalid JSON body." });
                return;
            }

            if (!payload || typeof payload !== "object") {
                sendJson(400, { error: "Login token, name, race name, and class name are required." });
                return;
            }

            const loginToken = typeof payload.loginToken === "string" ? payload.loginToken.trim() : "";
            const characterName = typeof payload.characterName === "string" ? payload.characterName.trim() : "";
            const raceName = typeof payload.characterRaceName === "string" ? payload.characterRaceName.trim() : "";
            const className = typeof payload.characterClassName === "string" ? payload.characterClassName.trim() : "";

            if (!loginToken || !characterName || !raceName || !className) {
                sendJson(400, { error: "Login token, name, race name, and class name are required." });
                return;
            }

            const user = await this._userRepository.findByLoginToken(loginToken);
            if (!user) {
                sendJson(401, { error: "Authentication required." });
                return;
            }

            const nameValidation = this._characterNameValidator.validate(characterName);
            if (!nameValidation.isValid) {
                sendJson(400, { error: nameValidation.error ?? "Invalid character name." });
                return;
            }

            const existingCharacter = await this._characterRepository.findByName(nameValidation.formattedName);
            if (existingCharacter) {
                sendJson(409, { error: "Character name already exists." });
                return;
            }

            const characterData: CharacterCreateData = {
                className,
                name: nameValidation.formattedName,
                raceName,
                userId: user.id
            };

            const createdCharacter = await this._characterRepository.createCharacter(characterData);

            sendJson(201, {
                character: {
                    className: createdCharacter.className,
                    id: createdCharacter.id,
                    name: createdCharacter.name,
                    raceName: createdCharacter.raceName
                },
                message: "Character created."
            });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Character creation failed: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}
