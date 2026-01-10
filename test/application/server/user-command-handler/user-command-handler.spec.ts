import { type SocketServer } from "../../../../src/application/server/types/http";
import { UserCommandHandler } from "../../../../src/application/server/user-command-handler";
import { CharacterClass } from "../../../../src/game/character-class";
import { Item } from "../../../../src/game/item";
import { NonPlayerCharacter } from "../../../../src/game/non-player-character";
import { Race } from "../../../../src/game/race";
import { Room } from "../../../../src/game/room";
import { World } from "../../../../src/game/world";
import { Zone } from "../../../../src/game/zone";
import { ITEM_TYPE } from "../../../../src/game/types/item-type";
import { expect } from "chai";

class FakeSocketServer {

    private _roomEmits: Array<Record<string, unknown>> = [];

    public get roomEmits(): Array<Record<string, unknown>> {
        return this._roomEmits;
    }

    public to(roomId: string): { emit: (event: string, payload: unknown) => void } {
        return {
            emit: (event: string, payload: unknown) => {
                this._roomEmits.push({ event, payload, roomId });
            }
        };
    }

}

class FakeSocket {

    private _emits: Array<Record<string, unknown>> = [];
    private _id: string;
    private _joinedRooms: Set<string> = new Set();
    private _leftRooms: string[] = [];

    constructor(id: string) {
        this._id = id;
    }

    public emit(event: string, payload: unknown): void {
        this._emits.push({ event, payload });
    }

    public get emits(): Array<Record<string, unknown>> {
        return this._emits;
    }

    public get id(): string {
        return this._id;
    }

    public get joinedRooms(): string[] {
        return Array.from(this._joinedRooms.values());
    }

    public get leftRooms(): string[] {
        return this._leftRooms;
    }

    public join(roomId: string): void {
        this._joinedRooms.add(roomId);
    }

    public leave(roomId: string): void {
        this._leftRooms.push(roomId);
        this._joinedRooms.delete(roomId);
    }

    public to(roomId: string): { emit: (event: string, payload: unknown) => void } {
        return {
            emit: (event: string, payload: unknown) => {
                this._emits.push({ event: `room:${roomId}:${event}`, payload });
            }
        };
    }

}

describe(`[Class] UserCommandHandler`, () => {
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

    const clericClass = new CharacterClass("cleric", "Cleric", "Devout healers.", clericModifiers, baseHealth);
    const humanRace = new Race("human", "Human", "Versatile adventurers.", humanBaseAttributes, baseHealth);
    const warriorClass = new CharacterClass("warrior", "Warrior", "Disciplined fighters.", warriorModifiers, baseHealth);
    const classes = [clericClass, warriorClass];
    const races = [humanRace];

    const createWorld = (): World => {
        return new World([
            new Zone("starter-zone", "Starter Zone", [
                new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", { south: "atrium" })
            ], "atrium")
        ], races, classes, "starter-zone", "atrium");
    };

    const createWorldWithItems = (items: Item[]): World => {
        return new World([
            new Zone("starter-zone", "Starter Zone", [
                new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", { south: "atrium" })
            ], "atrium")
        ], races, classes, "starter-zone", "atrium", items);
    };

    describe(`[Method] handleCommand`, () => {

        it(`should broadcast chat messages when players say something`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocketServer = new FakeSocketServer();
            const fakeSocket = new FakeSocket("player-1");

            handler.setSocketServer(fakeSocketServer as unknown as SocketServer);
            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "say hello there");

            expect(fakeSocketServer.roomEmits).to.have.lengthOf(1);
            expect(fakeSocketServer.roomEmits[0].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[0].roomId).to.equal("atrium");
            expect(fakeSocketServer.roomEmits[0].payload).to.include({ message: "Tester says, \"hello there\".", playerName: "Tester" });
        });

        it(`should broadcast shouts to every room in the zone and echo the sender`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "shout hello there");

            const roomEmits = fakeSocket.emits.filter((emit) => typeof emit.event === "string" && emit.event.startsWith("room:"));
            const selfEmits = fakeSocket.emits.filter((emit) => emit.event === "world:chat");

            expect(roomEmits).to.have.lengthOf(2);
            expect(roomEmits.map((emit) => emit.event)).to.have.members([
                "room:atrium:world:chat",
                "room:lounge:world:chat"
            ]);
            roomEmits.forEach((emit) => {
                expect(emit.payload).to.include({ category: "Shout", message: "Tester shouts \"hello there\".", playerName: "Tester" });
            });
            expect(selfEmits).to.have.lengthOf(1);
            expect(selfEmits[0].payload).to.include({ category: "Shout", message: "You shout \"hello there\"." });
        });

        it(`should let non-player characters respond to hails`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass, "Welcome aboard.")
                    ]),
                    new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", { south: "atrium" })
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocketServer = new FakeSocketServer();
            const fakeSocket = new FakeSocket("player-1");

            handler.setSocketServer(fakeSocketServer as unknown as SocketServer);
            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "say Hail Greeter");

            expect(fakeSocketServer.roomEmits).to.have.lengthOf(2);
            expect(fakeSocketServer.roomEmits[1].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[1].payload).to.include({ message: "Greeter says, \"Welcome aboard.\"", playerName: "Greeter" });
        });

        it(`should let players hail their primary target`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass, "Welcome aboard.")
                    ])
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocketServer = new FakeSocketServer();
            const fakeSocket = new FakeSocket("player-1");

            handler.setSocketServer(fakeSocketServer as unknown as SocketServer);
            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "target Greeter");
            handler.handleCommand(fakeSocket, "Hail");

            expect(fakeSocketServer.roomEmits).to.have.lengthOf(2);
            expect(fakeSocketServer.roomEmits[0].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[0].payload).to.include({ message: "Tester says, \"Hail, Greeter\".", playerName: "Tester" });
            expect(fakeSocketServer.roomEmits[1].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[1].payload).to.include({ message: "Greeter says, \"Welcome aboard.\"", playerName: "Greeter" });
        });

        it(`should let players hail with no target`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocketServer = new FakeSocketServer();
            const fakeSocket = new FakeSocket("player-1");

            handler.setSocketServer(fakeSocketServer as unknown as SocketServer);
            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "Hail");

            expect(fakeSocketServer.roomEmits).to.have.lengthOf(1);
            expect(fakeSocketServer.roomEmits[0].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[0].payload).to.include({ message: "Tester says, \"Hail\".", playerName: "Tester" });
        });

        it(`should emit room snapshots when looking`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "look");

            expect(fakeSocket.emits).to.have.lengthOf(2);
            expect(fakeSocket.emits[0].event).to.equal("world:room");
            expect(fakeSocket.emits[0].payload).to.include({ id: "atrium", name: "Atrium" });
            expect(fakeSocket.emits[0].payload.zone).to.deep.equal({ id: "starter-zone", name: "Starter Zone" });
            expect(fakeSocket.emits[1].event).to.equal("world:system");
            expect(fakeSocket.emits[1].payload).to.deep.equal({
                category: "RoomDescription",
                message: "[Atrium] A neon-lit atrium with flickering signage and a humming terminal."
            });
        });

        it(`should emit the next room description when looking in a direction`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "look north");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload).to.deep.equal({
                category: "RoomDescription",
                message: "[Lounge] A quiet lounge with battered sofas and a wall of monitors."
            });
        });

        it(`should warn when looking in a direction without a room`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "look east");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload).to.deep.equal({
                category: "RoomDescription",
                message: "There is nothing in that direction"
            });
        });

        it(`should list player details when using char`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "char");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal([
                "Name: Tester",
                "Race: Human",
                "Race Description: Versatile adventurers.",
                "Class: Warrior",
                "Class Description: Disciplined fighters.",
                "Strength: 12",
                "Agility: 11",
                "Dexterity: 11",
                "Perception: 10",
                "Constitution: 12",
                "Wisdom: 9",
                "Intelligence: 9",
                "Charisma: 11",
                "Resolve: 11",
                "Health: 33",
                "Current Health: 33",
                "Current Experience: 0",
                "Experience Until Next Level: 1000",
                "Damage: 10",
                "Attack Delay: 5s",
                "Mana: 20"
            ].join("\n"));
        });

        it(`should list inventory items when using inventory`, () => {
            const bread = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);
            const waterFlask = new Item("water flask", "A leather-bound flask.", ITEM_TYPE.DRINK, 20);
            const amulet = new Item("amulet", "A small charm.", ITEM_TYPE.POTION);
            const world = createWorldWithItems([bread, waterFlask, amulet]);
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");
            const player = world.getPlayer(fakeSocket.id);
            if (!player) {
                throw new Error("Player not found.");
            }

            player.inventory.addItem(amulet, 1);

            handler.handleCommand(fakeSocket, "inventory");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal([
                "5 bread",
                "5 water flask",
                "amulet"
            ].join("\n"));
        });

        it(`should prompt when eat commands are missing valid targets`, () => {
            const bread = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);
            const world = createWorldWithItems([bread]);
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "eat br");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal("what would you like you eat?");
        });

        it(`should consume food when eating inventory items`, () => {
            const bread = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);
            const world = createWorldWithItems([bread]);
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");
            const player = world.getPlayer(fakeSocket.id);
            if (!player) {
                throw new Error("Player not found.");
            }

            handler.handleCommand(fakeSocket, "eat bre");

            const slot = player.inventory.slots[0];
            if (!slot) {
                throw new Error("Inventory slot missing.");
            }

            expect(slot.count).to.equal(4);
            expect(fakeSocket.emits).to.have.lengthOf(2);
            expect(fakeSocket.emits[0].payload.message).to.equal("You eat the bread");
            expect(fakeSocket.emits[1].event).to.equal("room:atrium:world:system");
            expect(fakeSocket.emits[1].payload.message).to.equal("Tester ate a bread");
        });

        it(`should reject drink commands for non-drink items`, () => {
            const bread = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);
            const world = createWorldWithItems([bread]);
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "drink bre");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].payload.message).to.equal("You can't find anything like that to drink");
        });

        it(`should consume drinks when drinking inventory items`, () => {
            const bread = new Item("bread", "A crusty loaf.", ITEM_TYPE.FOOD, 20);
            const waterFlask = new Item("water flask", "A leather-bound flask.", ITEM_TYPE.DRINK, 20);
            const world = createWorldWithItems([bread, waterFlask]);
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");
            const player = world.getPlayer(fakeSocket.id);
            if (!player) {
                throw new Error("Player not found.");
            }

            handler.handleCommand(fakeSocket, "drink wat");

            const slot = player.inventory.slots[1];
            if (!slot) {
                throw new Error("Inventory slot missing.");
            }

            expect(slot.count).to.equal(4);
            expect(fakeSocket.emits).to.have.lengthOf(2);
            expect(fakeSocket.emits[0].payload.message).to.equal("You drink the water flask.");
            expect(fakeSocket.emits[1].event).to.equal("room:atrium:world:system");
            expect(fakeSocket.emits[1].payload.message).to.equal("Tester drank a water flask");
        });

        it(`should move players when using directions`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "north");

            expect(fakeSocket.leftRooms).to.deep.equal(["atrium"]);
            expect(fakeSocket.joinedRooms).to.deep.equal(["lounge"]);
            expect(fakeSocket.emits[0].event).to.equal("world:room");
            expect(fakeSocket.emits[1].event).to.equal("world:system");
            expect(fakeSocket.emits[1].payload.message).to.equal("You move north, you have entered Lounge");
            expect(fakeSocket.emits[2].event).to.equal("room:atrium:world:system");
            expect(fakeSocket.emits[3].event).to.equal("room:lounge:world:system");
        });

        it(`should move players when using direction aliases`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "n");

            expect(fakeSocket.leftRooms).to.deep.equal(["atrium"]);
            expect(fakeSocket.joinedRooms).to.deep.equal(["lounge"]);
            expect(fakeSocket.emits[1].payload.message).to.equal("You move north, you have entered Lounge");
        });

        it(`should warn when using unknown commands`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "move north");

            expect(fakeSocket.leftRooms).to.deep.equal([]);
            expect(fakeSocket.joinedRooms).to.deep.equal([]);
            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal("Unknown command: move north");
        });

        it(`should list players when using who`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { east: "market" })
                ], "atrium"),
                new Zone("market-zone", "Market Zone", [
                    new Room("market", "Market", "A bustling market with vendors and neon signs.", { west: "atrium" })
                ], "market")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");
            world.addPlayer("player-2", "Guest", "Human", "Warrior");
            world.movePlayer("player-2", "east");

            handler.handleCommand(fakeSocket, "who");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal("Tester\nThere are 1 players in Starter Zone");
        });

        it(`should update targets when using the target command`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass)
                    ])
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "target Greeter");

            expect(fakeSocket.emits).to.have.lengthOf(2);
            expect(fakeSocket.emits[0].event).to.equal("world:room");
            expect(fakeSocket.emits[0].payload.player.primaryTargetName).to.equal("Greeter");
            expect(fakeSocket.emits[0].payload.player.primaryTargetVitals).to.deep.equal({
                currentHealth: 31,
                maxHealth: 31
            });
            expect(fakeSocket.emits[1].event).to.equal("world:system");
            expect(fakeSocket.emits[1].payload.message).to.equal("Primary target set to Greeter.");
        });

        it(`should warn when killing with no primary target`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "kill");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal("No primary target selected.");
        });

        it(`should set a primary target when killing by name`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass)
                    ])
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "kill Greeter");

            const targetRoomEmit = fakeSocket.emits.find((emit) => emit.event === "world:room"
                && emit.payload.player.primaryTargetName === "Greeter");
            expect(targetRoomEmit).to.not.equal(undefined);
            const systemMessages = fakeSocket.emits
                .filter((emit) => emit.event === "world:system")
                .map((emit) => (emit.payload as { message: string }).message);
            expect(systemMessages).to.include("You are now attacking Greeter.");
        });

        it(`should toggle attacking off when issuing kill again`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass)
                    ])
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "target Greeter");
            handler.handleCommand(fakeSocket, "kill");
            handler.handleCommand(fakeSocket, "kill");

            const systemMessages = fakeSocket.emits
                .filter((emit) => emit.event === "world:system")
                .map((emit) => (emit.payload as { message: string }).message);
            expect(systemMessages).to.include("You are now attacking Greeter.");
            expect(systemMessages).to.include("You stop attacking.");
        });

        it(`should honor the attack delay when restarting kills`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass)
                    ])
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");
            const originalNow = Date.now;

            try {
                Date.now = () => 1000;
                world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

                handler.handleCommand(fakeSocket, "target Greeter");
                handler.handleCommand(fakeSocket, "kill");
                handler.handleCommand(fakeSocket, "kill");

                Date.now = () => 2000;
                handler.handleCommand(fakeSocket, "kill");

                const systemMessages = fakeSocket.emits
                    .filter((emit) => emit.event === "world:system")
                    .map((emit) => (emit.payload as { message: string }).message);
                expect(systemMessages).to.include("You are now attacking Greeter.");
                expect(systemMessages).to.include("You hit Greeter for 10 damage.");
                expect(systemMessages).to.include("You stop attacking.");
            } finally {
                Date.now = originalNow;
            }
        });

        it(`should let non-player characters retaliate when attacked`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", humanRace, clericClass)
                    ])
                ], "atrium")
            ], races, classes, "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester", "Human", "Warrior");

            handler.handleCommand(fakeSocket, "target Greeter");
            handler.handleCommand(fakeSocket, "kill");

            const attackMessage = fakeSocket.emits.find((emit) => {
                const payload = emit.payload as { category?: string; message?: string };
                return emit.event === "world:system"
                    && payload.category === "SelfRecieveAttackDamage"
                    && payload.message === "Greeter hits YOU for 5 damage!";
            });

            expect(attackMessage).to.not.equal(undefined);
        });

        it(`should warn on unknown commands`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            handler.handleCommand(fakeSocket, "dance");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload.message).to.equal("Unknown command: dance");
        });

    });

});

