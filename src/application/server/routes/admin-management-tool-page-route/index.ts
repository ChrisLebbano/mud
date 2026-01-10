import { type UserRepository } from "../../user-repository";
import { MethodServerRoute } from "../method-server-route";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class AdminManagementToolPageRoute extends MethodServerRoute {

    constructor(userRepository: UserRepository) {
        const filePath = join(__dirname, ".", "admin-management-tool.html");
        const adminManagementToolHtml = readFileSync(filePath, { encoding: "utf-8" });

        super("/admin/manegement-tool", "GET", (request, response) => {
            const run = async (): Promise<void> => {
                const requestUrl = new URL(request.url ?? "", "http://localhost");
                const loginToken = requestUrl.searchParams.get("loginToken")?.trim() ?? "";

                if (!loginToken) {
                    response.statusCode = 401;
                    response.setHeader("Content-Type", "text/plain");
                    response.end("Authentication required.");
                    return;
                }

                const user = await userRepository.findByLoginToken(loginToken);
                if (!user || !user.isAdmin) {
                    response.statusCode = 403;
                    response.setHeader("Content-Type", "text/plain");
                    response.end("Admin access required.");
                    return;
                }

                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.end(adminManagementToolHtml);
            };

            void run().catch((error: unknown) => {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[ERROR] Admin management tool page failed: ${message}`);
                response.statusCode = 500;
                response.setHeader("Content-Type", "text/plain");
                response.end("Internal server error.");
            });
        });
    }

}

