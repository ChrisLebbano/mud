import { MethodServerRoute } from "../method-server-route";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class LoginPageRoute extends MethodServerRoute {

    constructor() {
        const filePath = join(__dirname, "..", "login-page.html");
        const loginPageHtml = readFileSync(filePath, { encoding: "utf-8" });

        super("/login", "GET", (_request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html");
            response.end(loginPageHtml);
        });
    }

}
