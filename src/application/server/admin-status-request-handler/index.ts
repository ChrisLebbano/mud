import { type UserRepository } from "../user-repository";
import { type IncomingMessage, type ServerResponse } from "node:http";

export class AdminStatusRequestHandler {

    private _userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
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

            sendJson(200, { isAdmin: user.isAdmin });
        };

        void run().catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[ERROR] Admin status check failed: ${message}`);
            sendJson(500, { error: "Internal server error." });
        });
    }

}

