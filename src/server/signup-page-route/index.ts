import { MethodServerRoute } from "../method-server-route";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export class SignupPageRoute extends MethodServerRoute {

    constructor() {
        const filePath = join(__dirname, ".", "signup-page.html");
        const signupPageHtml = readFileSync(filePath, { encoding: "utf-8" });

        super("/signup", "GET", (_request, response) => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html");
            response.end(signupPageHtml);
        });
    }

}

