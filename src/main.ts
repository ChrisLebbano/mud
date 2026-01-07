import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { Application } from "./application";
import { type ServerConfig, type WorldData } from "./types";
import { World } from "./world";

/**
 * The main entry point for the application.
 * This is the only file that should directly access the Node.js process object.
 */

loadEnvFile('.env');

const serverConfig: ServerConfig = {
    authSecret: process.env.AUTH_SECRET ? process.env.AUTH_SECRET : "dev-auth-secret",
    databaseConfig: {
        database: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : "mud",
        host: process.env.MYSQL_HOST ? process.env.MYSQL_HOST : "127.0.0.1",
        password: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : "mud_password",
        port: parseInt(process.env.MYSQL_PORT ? process.env.MYSQL_PORT : "3306"),
        user: process.env.MYSQL_USER ? process.env.MYSQL_USER : "mud_user"
    },
    port: parseInt(process.env.PORT || "8080"),
    tokenSecret: process.env.JWT_SECRET ? process.env.JWT_SECRET : "dev-jwt-secret"
};

const worldDataPath = resolve(process.cwd(), "data", "world.json");
const worldData = JSON.parse(readFileSync(worldDataPath, "utf8")) as WorldData;
const world = World.fromData(worldData);

const application = new Application(serverConfig, world);

application.init();
