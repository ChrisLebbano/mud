import { loadEnvFile } from "node:process";
import { Application } from "./application";
import { NonPlayerCharacter } from "./non-player-character";
import { Room } from "./room";
import { type ServerConfig } from "./types";
import { World } from "./world";
import { Zone } from "./zone";

/**
 * The main entry point for the application.
 * This is the only file that should directly access the Node.js process object.
 */

loadEnvFile('.env');

const serverConfig: ServerConfig = {
    port: parseInt(process.env.PORT || "8080")
};

const world = new World([
    new Zone("starter-zone", "Starter Zone", [
        new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", {
            east: "library",
            north: "lounge",
            west: "workshop"
        }, [
            new NonPlayerCharacter("npc-guide", "Terminal Guide", "atrium", "Welcome to the terminal atrium. Need a hand getting started?")
        ]),
        new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", {
            north: "observatory",
            south: "atrium"
        }, [
            new NonPlayerCharacter("npc-analyst", "Caffeinated Analyst", "lounge")
        ]),
        new Room("library", "Library", "A hushed library of holographic shelves and whispering index lights.", { west: "atrium" }, [
            new NonPlayerCharacter("npc-librarian", "Archivist Imani", "library")
        ]),
        new Room("workshop", "Workshop", "A workshop lined with humming tools and half-built drones.", {
            east: "atrium",
            south: "courtyard"
        }, [
            new NonPlayerCharacter("npc-mechanic", "Gearwright Tamsin", "workshop")
        ]),
        new Room("observatory", "Observatory", "A domed observatory with rotating lenses and a sky-map projector.", { south: "lounge" }, [
            new NonPlayerCharacter("npc-starwatcher", "Starwatcher Orin", "observatory")
        ]),
        new Room("courtyard", "Courtyard", "An open courtyard with bioluminescent planters and soft mist.", { north: "workshop" }, [
            new NonPlayerCharacter("npc-gardener", "Gardener Rue", "courtyard")
        ])
    ], "atrium")
], "starter-zone", "atrium");

const application = new Application(serverConfig, world);

application.init();
