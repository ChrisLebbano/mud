import { CharacterClass } from "../../../src/game/character-class";
import { NonPlayerCharacter } from "../../../src/game/non-player-character";
import { Race } from "../../../src/game/race";
import { Room } from "../../../src/game/room";
import { ITEM_TYPE, type WorldClassData, type WorldData, type WorldRaceData } from "../../../src/game/types/world-data";
import { World } from "../../../src/game/world";
import { Zone } from "../../../src/game/zone";
import { expect } from "chai";

describe(`[Class] World`, () => {
    const baseHealth = 10;
    const clericModifiers = {
        agility: 0,
        charisma: 1,
        constitution: 1,
        dexterity: 0,
        health: 4,
        intelligence: 2,
        mana: 6,
        perception: 1,
        resolve: 2,
        strength: -1,
        wisdom: 2
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

    const creatureBaseAttributes = {
        agility: 11,
        charisma: 6,
        constitution: 12,
        dexterity: 9,
        health: 0,
        intelligence: 8,
        mana: 16,
        perception: 11,
        resolve: 9,
        strength: 12,
        wisdom: 8
    };

    const humanBaseAttributes = {
        agility: 10,
        charisma: 12,
        constitution: 10,
        dexterity: 10,
        health: 0,
        intelligence: 10,
        mana: 22,
        perception: 10,
        resolve: 10,
        strength: 10,
        wisdom: 10
    };

    const clericClass = new CharacterClass("cleric", "Cleric", "Devout healers.", clericModifiers, baseHealth);
    const creatureRace = new Race("creature", "Creature", "Wild denizens.", creatureBaseAttributes, baseHealth);
    const humanRace = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
    const warriorClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
    const classes = [clericClass, warriorClass];
    const races = [creatureRace, humanRace];

    describe(`[Method] addPlayer`, () => {

        it(`should add players to the starting room`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");
            const result = world.addPlayer("player-1", "Alex", "Creature", "Cleric");
            const player = world.getPlayer("player-1");

            expect(result.roomId).to.equal("atrium");
            expect(result.roomSnapshot.players).to.include("Alex");
            expect(result.roomSnapshot.player?.race.name).to.equal("Creature");
            expect(result.roomSnapshot.player?.characterClass.name).to.equal("Cleric");
            expect(player?.inventory.slots.filter((slot) => slot !== null)).to.have.length(0);
        });

    });

    describe(`[Method] fromData`, () => {

        it(`should build a world from data`, () => {
            const worldData: WorldData = {
                startingRoomId: "atrium",
                startingZoneId: "starter-zone",
                zones: [
                    {
                        id: "starter-zone",
                        name: "Starter Zone",
                        rooms: [
                            {
                                description: "A bright room.",
                                exits: { north: "lounge" },
                                id: "atrium",
                                name: "Atrium"
                            },
                            {
                                description: "A quiet lounge.",
                                exits: { south: "atrium" },
                                id: "lounge",
                                name: "Lounge"
                            }
                        ],
                        startingRoomId: "atrium"
                    }
                ]
            };
            const raceData: WorldRaceData[] = [
                {
                    baseAttributes: humanBaseAttributes,
                    baseHealth,
                    description: "Versatile adventurers.",
                    id: "human",
                    name: "Human"
                }
            ];
            const classData: WorldClassData[] = [
                {
                    attributeModifiers: warriorModifiers,
                    baseHealth,
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                }
            ];
            const nonPlayerCharacterData = [
                {
                    classId: "warrior",
                    hailResponse: "Hello there.",
                    id: "npc-1",
                    name: "Greeter",
                    raceId: "human",
                    roomId: "atrium"
                }
            ];

            const world = World.fromData(worldData, raceData, classData, [], nonPlayerCharacterData);
            const room = world.getRoom("atrium");

            expect(room?.name).to.equal("Atrium");
            expect(room?.nonPlayerCharacters.map((npc) => npc.name)).to.deep.equal(["Greeter"]);
        });

    });

    describe(`[Method] movePlayer`, () => {

        it(`should move players between rooms`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            const moveResult = world.movePlayer("player-1", "north");

            if ("error" in moveResult) {
                throw new Error(moveResult.error);
            }

            expect(moveResult.fromRoomId).to.equal("atrium");
            expect(moveResult.toRoomId).to.equal("lounge");
            expect(moveResult.roomSnapshot.id).to.equal("lounge");
        });

        it(`should clear targets when players move rooms`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }, [
                    new NonPlayerCharacter("npc-guard", "Guard", "atrium", humanRace, warriorClass)
                ]),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            world.addPlayer("player-2", "Riley", "Human", "Warrior");

            world.setPrimaryTarget("player-1", "Riley");
            world.setPrimaryTarget("player-2", "Guard");

            const moveResult = world.movePlayer("player-2", "north");
            if ("error" in moveResult) {
                throw new Error(moveResult.error);
            }

            const playerOne = world.getPlayer("player-1");
            const playerTwo = world.getPlayer("player-2");

            expect(playerOne?.primaryTarget).to.equal(undefined);
            expect(playerTwo?.primaryTarget).to.equal(undefined);
        });

    });

    describe(`[Method] removePlayer`, () => {

        it(`should remove players from the world`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            const removed = world.removePlayer("player-1");

            expect(removed).to.deep.equal({ playerName: "Alex", roomId: "atrium" });
            expect(world.getPlayer("player-1")).to.equal(undefined);
        });

    });

    describe(`[Method] say`, () => {

        it(`should return chat scoped to the player room`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            world.addPlayer("player-2", "Riley", "Human", "Warrior");

            const moveResult = world.movePlayer("player-2", "north");
            if ("error" in moveResult) {
                throw new Error(moveResult.error);
            }

            const chatResult = world.say("player-2", "Hello from the lounge");
            if ("error" in chatResult) {
                throw new Error(chatResult.error);
            }

            expect(chatResult.chatMessage.message).to.equal("Riley says, \"Hello from the lounge\".");
            expect(chatResult.chatMessage.roomId).to.equal("lounge");
            expect(chatResult.chatMessage.playerName).to.equal("Riley");
        });

    });

    describe(`[Method] shout`, () => {

        it(`should return zone room ids with shout messages`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge.", { south: "atrium" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");

            const shoutResult = world.shout("player-1", "Hello everyone");
            if ("error" in shoutResult) {
                throw new Error(shoutResult.error);
            }

            expect(shoutResult.chatMessage.message).to.equal("Alex shouts \"Hello everyone\".");
            expect(shoutResult.selfMessage.message).to.equal("You shout \"Hello everyone\".");
            expect(shoutResult.roomIds).to.have.members(["atrium", "lounge"]);
        });

    });

    describe(`[Method] getRoom`, () => {

        it(`should return rooms by id`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            const room = world.getRoom("atrium");

            expect(room?.name).to.equal("Atrium");
        });

    });

    describe(`[Method] getRoomSnapshot`, () => {

        it(`should include player names in snapshots`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            const snapshot = world.getRoomSnapshot("atrium", "player-1");

            expect(snapshot.players).to.deep.equal(["Alex"]);
            expect(snapshot.player).to.deep.equal({
                attributes: {
                    agility: 11,
                    charisma: 11,
                    constitution: 12,
                    dexterity: 11,
                    health: 6,
                    intelligence: 9,
                    mana: 20,
                    perception: 10,
                    resolve: 11,
                    strength: 12,
                    wisdom: 9
                },
                characterClass: {
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                },
                currentHealth: 33,
                id: "player-1",
                maxHealth: 33,
                name: "Alex",
                primaryTargetName: undefined,
                primaryTargetVitals: undefined,
                race: {
                    description: "Versatile adventurers.",
                    id: "human",
                    name: "Human"
                },
                roomId: "atrium"
            });
            expect(snapshot.nonPlayerCharacters).to.deep.equal([]);
            expect(snapshot.zone).to.deep.equal({ id: "starter-zone", name: "Starter Zone" });
        });

    });

    describe(`[Method] performAttack`, () => {

        it(`should apply damage to the target`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }, [
                    new NonPlayerCharacter("npc-guard", "Guard", "atrium", humanRace, warriorClass)
                ])
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            world.setPrimaryTarget("player-1", "Guard");

            const attackResult = world.performAttack("player-1");

            if ("error" in attackResult || "warning" in attackResult) {
                throw new Error(attackResult.error ?? attackResult.warning);
            }

            expect(attackResult.damage).to.equal(10);
            expect(attackResult.targetName).to.equal("Guard");
            expect(attackResult.targetCurrentHealth).to.equal(23);
        });

        it(`should warn when attacking a dead target`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }, [
                    new NonPlayerCharacter("npc-guard", "Guard", "atrium", humanRace, warriorClass)
                ])
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            world.setPrimaryTarget("player-1", "Guard");

            const room = world.getRoom("atrium");
            const target = room?.nonPlayerCharacters[0];
            if (!target) {
                throw new Error("Target not found.");
            }
            target.secondaryAttributes.currentHealth = 0;

            const attackResult = world.performAttack("player-1");

            if ("error" in attackResult) {
                throw new Error(attackResult.error);
            }

            expect(attackResult.warning).to.equal("Cannot attack Guard. Guard is already dead.");
        });

    });

    describe(`[Method] performNonPlayerCharacterAttack`, () => {

        it(`should apply damage from the non-player character to the player`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }, [
                    new NonPlayerCharacter("npc-guard", "Guard", "atrium", humanRace, warriorClass)
                ])
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");

            const attackResult = world.performNonPlayerCharacterAttack("npc-guard", "player-1");

            if ("error" in attackResult || "warning" in attackResult) {
                throw new Error(attackResult.error ?? attackResult.warning);
            }

            expect(attackResult.attackerName).to.equal("Guard");
            expect(attackResult.damage).to.equal(5);
            expect(attackResult.targetCurrentHealth).to.equal(28);
        });

    });

    describe(`[Method] setPrimaryTarget`, () => {

        it(`should set the target to a non-player character in the room`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { north: "lounge" }, [
                    new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass)
                ])
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const world = new World([zone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");

            const targetResult = world.setPrimaryTarget("player-1", "Greeter");

            if ("error" in targetResult) {
                throw new Error(targetResult.error);
            }

            expect(targetResult.targetName).to.equal("Greeter");
            expect(targetResult.roomSnapshot.player?.primaryTargetName).to.equal("Greeter");
        });

    });

    describe(`[Method] getPlayerNamesForZone`, () => {

        it(`should return player names for a zone`, () => {
            const rooms = [
                new Room("atrium", "Atrium", "A bright room.", { east: "market" })
            ];
            const zone = new Zone("starter-zone", "Starter Zone", rooms, "atrium");
            const marketZone = new Zone("market-zone", "Market Zone", [
                new Room("market", "Market", "A bustling market.", { west: "atrium" })
            ], "market");
            const world = new World([zone, marketZone], races, classes, "starter-zone", "atrium");

            world.addPlayer("player-1", "Alex", "Human", "Warrior");
            world.addPlayer("player-2", "Riley", "Human", "Warrior");
            world.movePlayer("player-2", "east");

            expect(world.getPlayerNamesForZone("starter-zone")).to.deep.equal(["Alex"]);
        });

    });

    describe(`[Method] items`, () => {

        it(`should return items built from data`, () => {
            const worldData: WorldData = {
                startingRoomId: "atrium",
                startingZoneId: "starter-zone",
                zones: [
                    {
                        id: "starter-zone",
                        name: "Starter Zone",
                        rooms: [
                            {
                                description: "A bright room.",
                                exits: {},
                                id: "atrium",
                                name: "Atrium"
                            }
                        ],
                        startingRoomId: "atrium"
                    }
                ]
            };
            const raceData: WorldRaceData[] = [
                {
                    baseAttributes: humanBaseAttributes,
                    baseHealth,
                    description: "Versatile adventurers.",
                    id: "human",
                    name: "Human"
                }
            ];
            const classData: WorldClassData[] = [
                {
                    attributeModifiers: warriorModifiers,
                    baseHealth,
                    description: "Disciplined fighters.",
                    id: "warrior",
                    name: "Warrior"
                }
            ];

            const world = World.fromData(worldData, raceData, classData, [
                {
                    description: "A vial of red liquid.",
                    name: "small health potion",
                    type: ITEM_TYPE.POTION
                }
            ]);

            expect(world.items.map((item) => item.name)).to.deep.equal(["small health potion"]);
        });

    });

});

