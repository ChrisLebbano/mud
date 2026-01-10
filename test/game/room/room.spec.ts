import { expect } from "chai";

import { CharacterClass } from "../../../src/game/character-class";
import { NonPlayerCharacter } from "../../../src/game/non-player-character";
import { Race } from "../../../src/game/race";
import { Room } from "../../../src/game/room";

describe(`[Class] Room`, () => {
    const baseHealth = 10;
    const humanBaseAttributes = {
        agility: 10,
        charisma: 12,
        constitution: 10,
        dexterity: 10,
        health: 42,
        intelligence: 10,
        mana: 22,
        perception: 10,
        resolve: 10,
        strength: 10,
        wisdom: 10
    };

    const warriorModifiers = {
        agility: 1,
        charisma: -1,
        constitution: 2,
        dexterity: 1,
        health: 6,
        intelligence: -1,
        mana: -2,
        perception: 0,
        resolve: 1,
        strength: 2,
        wisdom: -1
    };

    const characterClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
    const humanRace = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);

    describe(`[Method] addNonPlayerCharacter`, () => {

        it(`should track non-player characters in the room`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge" });
            const guide = new NonPlayerCharacter("npc-guide", "Guide", "atrium", humanRace, characterClass);
            const mechanic = new NonPlayerCharacter("npc-mechanic", "Mechanic", "atrium", humanRace, characterClass);

            room.addNonPlayerCharacter(guide);
            room.addNonPlayerCharacter(mechanic);

            expect(room.nonPlayerCharacters.map((character) => character.name)).to.deep.equal(["Guide", "Mechanic"]);

            room.removeNonPlayerCharacter("npc-guide");

            expect(room.nonPlayerCharacters.map((character) => character.name)).to.deep.equal(["Mechanic"]);
        });

    });

    describe(`[Method] addPlayer`, () => {

        it(`should track players entering and leaving`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge" });

            room.addPlayer("player-1");
            room.addPlayer("player-2");

            expect(room.playerIds).to.have.members(["player-1", "player-2"]);

            room.removePlayer("player-1");

            expect(room.playerIds).to.deep.equal(["player-2"]);
        });

    });

    describe(`[Method] getters`, () => {

        it(`should expose room metadata`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge" });

            expect(room.description).to.equal("A bright room.");
            expect(room.exitMap).to.deep.equal({ north: "lounge" });
            expect(room.id).to.equal("atrium");
            expect(room.name).to.equal("Atrium");
            expect(room.nonPlayerCharacters).to.deep.equal([]);
        });

    });

    describe(`[Method] toSnapshot`, () => {

        it(`should return a snapshot of the room`, () => {
            const room = new Room("atrium", "Atrium", "A bright room.", { north: "lounge", south: "garden" }, [
                new NonPlayerCharacter("npc-guide", "Guide", "atrium", humanRace, characterClass),
                new NonPlayerCharacter("npc-scribe", "Scribe", "atrium", humanRace, characterClass)
            ]);
            const snapshot = room.toSnapshot(["Zoe", "Alex"], { id: "starter-zone", name: "Starter Zone" });

            expect(snapshot).to.deep.equal({
                description: "A bright room.",
                exits: ["north", "south"],
                id: "atrium",
                name: "Atrium",
                nonPlayerCharacters: [
                    { id: "npc-guide", name: "Guide" },
                    { id: "npc-scribe", name: "Scribe" }
                ],
                players: ["Alex", "Zoe"],
                zone: { id: "starter-zone", name: "Starter Zone" }
            });
        });

    });

});

