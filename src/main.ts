import { Application } from "./application";
import { type ServerConfig } from "./types";
import { loadEnvFile } from "node:process";

/**
 * The main entry point for the application.
 * This is the only file that should directly access the Node.js process object.
 */

loadEnvFile('.env');

const serverConfig: ServerConfig = {
    port: parseInt(process.env.PORT || "8080")
};

const application = new Application(serverConfig);

application.init();
