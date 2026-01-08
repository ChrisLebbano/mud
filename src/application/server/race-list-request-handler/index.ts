import { type RaceRepositoryClient } from "../types/race-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class RaceListRequestHandler {

    private _raceRepository: RaceRepositoryClient;

    constructor(raceRepository: RaceRepositoryClient) {
        this._raceRepository = raceRepository;
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
            const races = await this._raceRepository.findAll();
            sendJson(200, {
                races: races.map((race) => ({
                    description: race.description,
                    id: race.id,
                    name: race.name
                }))
            });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Failed to load races: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}
