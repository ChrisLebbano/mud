import { Application } from "./application";
import { CharacterClassRepository } from "./application/server/character-class-repository";
import { DatabaseConnection } from "./application/server/database-connection";
import { RaceRepository } from "./application/server/race-repository";
import { type DatabaseConfig } from "./application/server/types/database";
import { type ServerConfig } from "./application/server/types/server-config";
import { type WorldClassData, type WorldData, type WorldRaceData } from "./game/types/world-data";
import { World } from "./game/world";
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
const databaseConnection = new DatabaseConnection(databaseConfig, createPool, databaseTestTableName);
const characterClassRepository = new CharacterClassRepository(databaseConnection);
const raceRepository = new RaceRepository(databaseConnection);

const loadWorld = async (): Promise<World> => {
    const classes = await characterClassRepository.findAll();
    const classData: WorldClassData[] = classes.map((characterClass) => ({
        attributeModifiers: characterClass.attributeModifiers,
        description: characterClass.description ?? "",
        id: characterClass.id.toString(),
        name: characterClass.name
    }));
    const races = await raceRepository.findAll();
    const raceData: WorldRaceData[] = races.map((race) => ({
        baseAttributes: race.baseAttributes,
        description: race.description ?? "",
        id: race.raceKey,
        name: race.name
    }));

    return World.fromData(worldData, raceData, classData);
};

const run = async (): Promise<void> => {
    await databaseConnection.testConnection("process start");
    const world = await loadWorld();
    const application = new Application(serverConfig, world, databaseConnection);
    application.init();
};

void run().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to start application: ${message}`);
});

