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
    port: parseInt(process.env.PORT || "8080")
};

const worldDataPath = resolve(process.cwd(), "data", "world.json");
const worldData = JSON.parse(readFileSync(worldDataPath, "utf8")) as WorldData;
const world = World.fromData(worldData);

const application = new Application(serverConfig, world);

application.init();
