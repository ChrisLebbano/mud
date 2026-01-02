import { expect } from "chai";
import { NonPlayerCharacter } from "../../src/non-player-character";
import { Room } from "../../src/room";
import { type SocketServer } from "../../src/types";
import { UserCommandHandler } from "../../src/user-command-handler";
import { World } from "../../src/world";
import { Zone } from "../../src/zone";

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

    const createWorld = (): World => {
        return new World([
            new Zone("starter-zone", "Starter Zone", [
                new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }),
                new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", { south: "atrium" })
            ], "atrium")
        ], "starter-zone", "atrium");
    };

    describe(`[Method] handleCommand`, () => {

        it(`should broadcast chat messages when players say something`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocketServer = new FakeSocketServer();
            const fakeSocket = new FakeSocket("player-1");

            handler.setSocketServer(fakeSocketServer as unknown as SocketServer);
            world.addPlayer(fakeSocket.id, "Tester");

            handler.handleCommand(fakeSocket, "say hello there");

            expect(fakeSocketServer.roomEmits).to.have.lengthOf(1);
            expect(fakeSocketServer.roomEmits[0].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[0].roomId).to.equal("atrium");
            expect(fakeSocketServer.roomEmits[0].payload).to.include({ message: "Tester says, \"hello there\".", playerName: "Tester" });
        });

        it(`should let non-player characters respond to hails`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { north: "lounge" }, [
                        new NonPlayerCharacter("npc-greeter", "Greeter", "atrium", "Welcome aboard.")
                    ]),
                    new Room("lounge", "Lounge", "A quiet lounge with battered sofas and a wall of monitors.", { south: "atrium" })
                ], "atrium")
            ], "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocketServer = new FakeSocketServer();
            const fakeSocket = new FakeSocket("player-1");

            handler.setSocketServer(fakeSocketServer as unknown as SocketServer);
            world.addPlayer(fakeSocket.id, "Tester");

            handler.handleCommand(fakeSocket, "say Hail Greeter");

            expect(fakeSocketServer.roomEmits).to.have.lengthOf(2);
            expect(fakeSocketServer.roomEmits[1].event).to.equal("world:chat");
            expect(fakeSocketServer.roomEmits[1].payload).to.include({ message: "Greeter says, \"Welcome aboard.\"", playerName: "Greeter" });
        });

        it(`should emit room snapshots when looking`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester");

            handler.handleCommand(fakeSocket, "look");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:room");
            expect(fakeSocket.emits[0].payload).to.include({ id: "atrium", name: "Atrium" });
            expect(fakeSocket.emits[0].payload.zone).to.deep.equal({ id: "starter-zone", name: "Starter Zone" });
        });

        it(`should move players when using directions`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester");

            handler.handleCommand(fakeSocket, "north");

            expect(fakeSocket.leftRooms).to.deep.equal(["atrium"]);
            expect(fakeSocket.joinedRooms).to.deep.equal(["lounge"]);
            expect(fakeSocket.emits[0].event).to.equal("world:room");
            expect(fakeSocket.emits[1].event).to.equal("world:system");
            expect(fakeSocket.emits[1].payload).to.equal("You move north, you have entered Lounge");
            expect(fakeSocket.emits[2].event).to.equal("room:atrium:world:system");
            expect(fakeSocket.emits[3].event).to.equal("room:lounge:world:system");
        });

        it(`should warn when using an unknown move direction`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester");

            handler.handleCommand(fakeSocket, "move j");

            expect(fakeSocket.leftRooms).to.deep.equal([]);
            expect(fakeSocket.joinedRooms).to.deep.equal([]);
            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload).to.equal("j is not a direction, please use 'north', 'south', 'east', or 'west'");
        });

        it(`should list players when using who`, () => {
            const world = new World([
                new Zone("starter-zone", "Starter Zone", [
                    new Room("atrium", "Atrium", "A neon-lit atrium with flickering signage and a humming terminal.", { east: "market" })
                ], "atrium"),
                new Zone("market-zone", "Market Zone", [
                    new Room("market", "Market", "A bustling market with vendors and neon signs.", { west: "atrium" })
                ], "market")
            ], "starter-zone", "atrium");
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            world.addPlayer(fakeSocket.id, "Tester");
            world.addPlayer("player-2", "Guest");
            world.movePlayer("player-2", "east");

            handler.handleCommand(fakeSocket, "who");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload).to.equal("Tester\nThere are 1 players in Starter Zone");
        });

        it(`should warn on unknown commands`, () => {
            const world = createWorld();
            const handler = new UserCommandHandler(world);
            const fakeSocket = new FakeSocket("player-1");

            handler.handleCommand(fakeSocket, "dance");

            expect(fakeSocket.emits).to.have.lengthOf(1);
            expect(fakeSocket.emits[0].event).to.equal("world:system");
            expect(fakeSocket.emits[0].payload).to.equal("Unknown command: dance");
        });

    });

});
