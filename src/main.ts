import { type WorldData } from "./game/types/world-data";
import { World } from "./game/world";
import { Application } from "./server/application";
import { DatabaseConnection } from "./server/database-connection";
import { type DatabaseConfig } from "./server/types/database";
import { type ServerConfig } from "./server/types/server-config";
import { createPool } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

/**
 * The main entry point for the application.
 * This is the only file that should directly access the Node.js process object.
 */

loadEnvFile('.env');

const serverConfig: ServerConfig = {
    port: parseInt(process.env.PORT || "8080")
};

const databaseConfig: DatabaseConfig = {
    database: process.env.MYSQL_DATABASE || "mud",
    host: process.env.MYSQL_HOST || "127.0.0.1",
    password: process.env.MYSQL_PASSWORD || "mud_password",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "mud_user"
};
const databaseTestTableName = "users";

const worldDataPath = resolve(process.cwd(), "data", "world.json");
const worldData = JSON.parse(readFileSync(worldDataPath, "utf8")) as WorldData;
const world = World.fromData(worldData);

const databaseConnection = new DatabaseConnection(databaseConfig, createPool, databaseTestTableName);
const application = new Application(serverConfig, world, databaseConnection);

void databaseConnection.testConnection("process start");

application.init();
