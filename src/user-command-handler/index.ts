import { NonPlayerCharacter } from "../non-player-character";
import { type ChatMessage, type GameSocket, type MoveCommand, type RoomSnapshot, type SocketServer } from "../types";
import { World } from "../world";

export class UserCommandHandler {

    private _allowedDirections: string[];
    private _attackTimeouts: Map<string, NodeJS.Timeout>;
    private _directionAliases: Map<string, string>;
    private _nonPlayerAttackTimeouts: Map<string, NodeJS.Timeout>;
    private _nonPlayerNextAttackTimes: Map<string, number>;
    private _nextAttackTimes: Map<string, number>;
    private _socketServer?: SocketServer;
    private _world: World;

    constructor(world: World) {
        this._allowedDirections = ["north", "south", "east", "west"];
        this._attackTimeouts = new Map();
        this._directionAliases = new Map([
            ["e", "east"],
            ["n", "north"],
            ["s", "south"],
            ["w", "west"]
        ]);
        this._nonPlayerAttackTimeouts = new Map();
        this._nonPlayerNextAttackTimes = new Map();
        this._nextAttackTimes = new Map();
        this._world = world;
    }

    public get allowedDirections(): string[] {
        return this._allowedDirections;
    }

    private getRemainingAttackDelay(playerId: string): number {
        const player = this._world.getPlayer(playerId);
        if (!player) {
            return 0;
        }

        const delayMs = player.secondaryAttributes.attackDelaySeconds * 1000;
        const nextAttackTime = this._nextAttackTimes.get(playerId);
        if (!nextAttackTime) {
            return delayMs;
        }

        const remainingDelay = nextAttackTime - Date.now();
        return remainingDelay > 0 ? remainingDelay : 0;
    }

    public handleCommand(socket: GameSocket, command: string): void {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            return;
        }

        const [verb, ...rest] = trimmedCommand.split(" ");
        const lowerVerb = verb.toLowerCase();
        const handleSay = (message: string): void => {
            const sayResult = this._world.say(socket.id, message);
            if ("error" in sayResult) {
                socket.emit("world:system", { category: "System", message: sayResult.error });
                return;
            }

            const chatMessage: ChatMessage = sayResult.chatMessage;
            this._socketServer?.to(chatMessage.roomId).emit("world:chat", chatMessage);
            const trimmedMessage = message.trim();
            const hailMatch = trimmedMessage.match(/^hail[, ]+(.+)/i);
            if (hailMatch) {
                const targetName = hailMatch[1].trim().toLowerCase();
                const room = this._world.getRoom(chatMessage.roomId);
                if (room) {
                    const matchingNonPlayerCharacter = room.nonPlayerCharacters
                        .find((nonPlayerCharacter) => nonPlayerCharacter.name.toLowerCase() === targetName);
                    const hailResponse = matchingNonPlayerCharacter?.respondToHail();
                    if (matchingNonPlayerCharacter && hailResponse) {
                        const trimmedResponse = hailResponse.trim();
                        const punctuationSuffix = /[.!?]$/.test(trimmedResponse) ? "" : ".";
                        const nonPlayerChatMessage: ChatMessage = {
                            category: "CharacterSpeech",
                            message: `${matchingNonPlayerCharacter.name} says, "${trimmedResponse}${punctuationSuffix}"`,
                            playerId: matchingNonPlayerCharacter.id,
                            playerName: matchingNonPlayerCharacter.name,
                            roomId: chatMessage.roomId
                        };
                        this._socketServer?.to(chatMessage.roomId).emit("world:chat", nonPlayerChatMessage);
                    }
                }
            }
        };

        if (lowerVerb === "hail") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            const targetName = player.primaryTarget?.name;
            const hailMessage = targetName ? `Hail, ${targetName}` : "Hail";
            handleSay(hailMessage);
            return;
        }

        if (lowerVerb === "say") {
            const message = rest.join(" ");
            handleSay(message);
            return;
        }

        if (lowerVerb === "look") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            const directionInput = rest.join(" ").trim().toLowerCase();
            if (!directionInput) {
                const roomSnapshot: RoomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                socket.emit("world:room", roomSnapshot);
                socket.emit("world:system", {
                    category: "RoomDescription",
                    message: `[${roomSnapshot.name}] ${roomSnapshot.description}`
                });
                return;
            }

            const normalizedDirection = this._directionAliases.get(directionInput) ?? directionInput;
            if (!this._allowedDirections.includes(normalizedDirection)) {
                socket.emit("world:system", { category: "RoomDescription", message: "There is nothing in that direction" });
                return;
            }

            const currentRoom = this._world.getRoom(player.roomId);
            if (!currentRoom) {
                socket.emit("world:system", { category: "System", message: "Room not found." });
                return;
            }

            const exitRoomId = currentRoom.exitMap[normalizedDirection];
            if (!exitRoomId) {
                socket.emit("world:system", { category: "RoomDescription", message: "There is nothing in that direction" });
                return;
            }

            const targetRoom = this._world.getRoom(exitRoomId);
            if (!targetRoom) {
                socket.emit("world:system", { category: "RoomDescription", message: "There is nothing in that direction" });
                return;
            }

            socket.emit("world:system", {
                category: "RoomDescription",
                message: `[${targetRoom.name}] ${targetRoom.description}`
            });
            return;
        }

        if (lowerVerb === "char") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            const attributes = player.attributes;
            const secondaryAttributes = player.secondaryAttributes;
            const listItems = [
                `Name: ${player.name}`,
                `Race: ${player.race.name}`,
                `Race Description: ${player.race.description}`,
                `Class: ${player.characterClass.name}`,
                `Class Description: ${player.characterClass.description}`,
                `Strength: ${attributes.strength}`,
                `Agility: ${attributes.agility}`,
                `Dexterity: ${attributes.dexterity}`,
                `Perception: ${attributes.perception}`,
                `Constitution: ${attributes.constitution}`,
                `Wisdom: ${attributes.wisdom}`,
                `Intelligence: ${attributes.intelligence}`,
                `Charisma: ${attributes.charisma}`,
                `Resolve: ${attributes.resolve}`,
                `Health: ${attributes.health}`,
                `Current Health: ${secondaryAttributes.currentHealth}`,
                `Current Experience: ${secondaryAttributes.currentExperience}`,
                `Experience Until Next Level: ${secondaryAttributes.experienceUntilNextLevel}`,
                `Damage: ${secondaryAttributes.attackDamage}`,
                `Attack Delay: ${secondaryAttributes.attackDelaySeconds}s`,
                `Mana: ${attributes.mana}`
            ];
            const listMessage = listItems.join("\n");
            socket.emit("world:system", { category: "System", message: listMessage });
            return;
        }

        if (lowerVerb === "kill") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            const targetName = rest.join(" ");
            const trimmedTargetName = targetName.trim();
            if (player.isAttacking && !trimmedTargetName) {
                this.stopAttacking(socket.id);
                socket.emit("world:system", { category: "System", message: "You stop attacking." });
                return;
            }

            if (trimmedTargetName) {
                const targetResult = this._world.setPrimaryTarget(socket.id, trimmedTargetName);
                if ("error" in targetResult) {
                    socket.emit("world:system", { category: "System", message: targetResult.error });
                    return;
                }
                socket.emit("world:room", targetResult.roomSnapshot);
            }

            if (player.isAttacking) {
                this.stopAttacking(socket.id);
            }

            const target = player.primaryTarget;
            if (!target) {
                socket.emit("world:system", { category: "System", message: "No primary target selected." });
                return;
            }

            if (!target.secondaryAttributes.isAlive) {
                socket.emit("world:system", { category: "System", message: `Cannot attack ${target.name}. ${target.name} is already dead.` });
                return;
            }

            player.isAttacking = true;
            socket.emit("world:system", { category: "System", message: `You are now attacking ${target.name}.` });

            const now = Date.now();
            const nextAttackTime = this._nextAttackTimes.get(socket.id);
            const attackDelayMs = player.secondaryAttributes.attackDelaySeconds * 1000;
            const isAttackReady = !nextAttackTime || now >= nextAttackTime;
            if (isAttackReady) {
                const attackResult = this._world.performAttack(socket.id);
                if ("error" in attackResult) {
                    this.stopAttacking(socket.id);
                    socket.emit("world:system", { category: "System", message: attackResult.error });
                    return;
                }

                if ("warning" in attackResult) {
                    this.stopAttacking(socket.id);
                    socket.emit("world:system", { category: "System", message: attackResult.warning });
                    if (attackResult.stopMessage) {
                        socket.emit("world:system", { category: "System", message: attackResult.stopMessage });
                    }
                    const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                    socket.emit("world:room", roomSnapshot);
                    return;
                }

                socket.emit("world:system", { category: "SelfDealingAttackDamage", message: `You hit ${attackResult.targetName} for ${attackResult.damage} damage.` });
                if (attackResult.targetPlayerId) {
                    this._socketServer?.to(attackResult.targetPlayerId).emit("world:system", {
                        category: "SelfRecieveAttackDamage",
                        message: `You are hit by ${attackResult.attackerName} for ${attackResult.damage} damage.`
                    });
                }
                const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                socket.emit("world:room", roomSnapshot);
                this._nextAttackTimes.set(socket.id, now + attackDelayMs);
            }

            const scheduleAttack = (): void => {
                const remainingDelay = this.getRemainingAttackDelay(socket.id);
                const nextTimeout = setTimeout(() => {
                    const scheduledAttackDelayMs = player.secondaryAttributes.attackDelaySeconds * 1000;
                    const nextAttackResult = this._world.performAttack(socket.id);
                    if ("error" in nextAttackResult) {
                        this.stopAttacking(socket.id);
                        socket.emit("world:system", { category: "System", message: nextAttackResult.error });
                        return;
                    }

                    if ("warning" in nextAttackResult) {
                        this.stopAttacking(socket.id);
                        socket.emit("world:system", { category: "System", message: nextAttackResult.warning });
                        if (nextAttackResult.stopMessage) {
                            socket.emit("world:system", { category: "System", message: nextAttackResult.stopMessage });
                        }
                        const nonPlayerTarget = player.primaryTarget instanceof NonPlayerCharacter ? player.primaryTarget : undefined;
                        if (nonPlayerTarget) {
                            const nonPlayerAttackTimeout = this._nonPlayerAttackTimeouts.get(nonPlayerTarget.id);
                            if (nonPlayerAttackTimeout) {
                                clearTimeout(nonPlayerAttackTimeout);
                                this._nonPlayerAttackTimeouts.delete(nonPlayerTarget.id);
                            }
                            this._nonPlayerNextAttackTimes.delete(nonPlayerTarget.id);
                            nonPlayerTarget.isAttacking = false;
                            nonPlayerTarget.primaryTarget = undefined;
                        }
                        const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                        socket.emit("world:room", roomSnapshot);
                        return;
                    }

                    socket.emit("world:system", { category: "SelfDealingAttackDamage", message: `You hit ${nextAttackResult.targetName} for ${nextAttackResult.damage} damage.` });
                    if (nextAttackResult.targetPlayerId) {
                        this._socketServer?.to(nextAttackResult.targetPlayerId).emit("world:system", {
                            category: "SelfRecieveAttackDamage",
                            message: `You are hit by ${nextAttackResult.attackerName} for ${nextAttackResult.damage} damage.`
                        });
                    }
                    const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                    socket.emit("world:room", roomSnapshot);
                    this._nextAttackTimes.set(socket.id, Date.now() + scheduledAttackDelayMs);
                    scheduleAttack();
                }, remainingDelay);

                this._attackTimeouts.set(socket.id, nextTimeout);
            };

            scheduleAttack();

            const nonPlayerTarget = target instanceof NonPlayerCharacter ? target : undefined;
            if (nonPlayerTarget) {
                nonPlayerTarget.isAttacking = true;
                nonPlayerTarget.primaryTarget = player;

                const stopNonPlayerAttacking = (): void => {
                    const attackTimeout = this._nonPlayerAttackTimeouts.get(nonPlayerTarget.id);
                    if (attackTimeout) {
                        clearTimeout(attackTimeout);
                        this._nonPlayerAttackTimeouts.delete(nonPlayerTarget.id);
                    }

                    this._nonPlayerNextAttackTimes.delete(nonPlayerTarget.id);
                    nonPlayerTarget.isAttacking = false;
                    nonPlayerTarget.primaryTarget = undefined;
                };

                const getRemainingNonPlayerAttackDelay = (): number => {
                    const delayMs = nonPlayerTarget.secondaryAttributes.attackDelaySeconds * 1000;
                    const nextNonPlayerAttackTime = this._nonPlayerNextAttackTimes.get(nonPlayerTarget.id);
                    if (!nextNonPlayerAttackTime) {
                        return delayMs;
                    }

                    const remainingDelay = nextNonPlayerAttackTime - Date.now();
                    return remainingDelay > 0 ? remainingDelay : 0;
                };

                const scheduleNonPlayerAttack = (): void => {
                    const remainingDelay = getRemainingNonPlayerAttackDelay();
                    const nextTimeout = setTimeout(() => {
                        const attackDelayMs = nonPlayerTarget.secondaryAttributes.attackDelaySeconds * 1000;
                        const attackResult = this._world.performNonPlayerCharacterAttack(nonPlayerTarget.id, player.id);
                        if ("error" in attackResult) {
                            stopNonPlayerAttacking();
                            socket.emit("world:system", { category: "System", message: attackResult.error });
                            return;
                        }

                        if ("warning" in attackResult) {
                            stopNonPlayerAttacking();
                            socket.emit("world:system", { category: "System", message: attackResult.warning });
                            if (attackResult.stopMessage) {
                                this.stopAttacking(socket.id);
                                socket.emit("world:system", { category: "System", message: attackResult.stopMessage });
                            }
                            const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                            socket.emit("world:room", roomSnapshot);
                            return;
                        }

                        socket.emit("world:system", {
                            category: "SelfRecieveAttackDamage",
                            message: `${attackResult.attackerName} hits YOU for ${attackResult.damage} damage!`
                        });
                        const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                        socket.emit("world:room", roomSnapshot);
                        this._nonPlayerNextAttackTimes.set(nonPlayerTarget.id, Date.now() + attackDelayMs);
                        scheduleNonPlayerAttack();
                    }, remainingDelay);

                    this._nonPlayerAttackTimeouts.set(nonPlayerTarget.id, nextTimeout);
                };

                if (!this._nonPlayerAttackTimeouts.has(nonPlayerTarget.id)) {
                    const attackDelayMs = nonPlayerTarget.secondaryAttributes.attackDelaySeconds * 1000;
                    const nextNonPlayerAttackTime = this._nonPlayerNextAttackTimes.get(nonPlayerTarget.id);
                    const isAttackReady = !nextNonPlayerAttackTime || now >= nextNonPlayerAttackTime;
                    if (isAttackReady) {
                        const attackResult = this._world.performNonPlayerCharacterAttack(nonPlayerTarget.id, player.id);
                        if ("error" in attackResult) {
                            stopNonPlayerAttacking();
                            socket.emit("world:system", { category: "System", message: attackResult.error });
                            return;
                        }

                        if ("warning" in attackResult) {
                            stopNonPlayerAttacking();
                            socket.emit("world:system", { category: "System", message: attackResult.warning });
                            if (attackResult.stopMessage) {
                                this.stopAttacking(socket.id);
                                socket.emit("world:system", { category: "System", message: attackResult.stopMessage });
                            }
                            const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                            socket.emit("world:room", roomSnapshot);
                            return;
                        }

                        socket.emit("world:system", {
                            category: "SelfRecieveAttackDamage",
                            message: `${attackResult.attackerName} hits YOU for ${attackResult.damage} damage!`
                        });
                        const roomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
                        socket.emit("world:room", roomSnapshot);
                        this._nonPlayerNextAttackTimes.set(nonPlayerTarget.id, now + attackDelayMs);
                    }

                    scheduleNonPlayerAttack();
                }
            }
            return;
        }

        if (lowerVerb === "who") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            const zone = this._world.getRoomSnapshot(player.roomId, player.id).zone;
            const playerNames = this._world.getPlayerNamesForZone(zone.id);
            const listItems = [
                ...playerNames,
                `There are ${playerNames.length} players in ${zone.name}`
            ];
            const listMessage = listItems.join("\n");
            socket.emit("world:system", { category: "System", message: listMessage });
            return;
        }

        if (lowerVerb === "target") {
            const targetName = rest.join(" ");
            const targetResult = this._world.setPrimaryTarget(socket.id, targetName);
            if ("error" in targetResult) {
                socket.emit("world:system", { category: "System", message: targetResult.error });
                return;
            }

            socket.emit("world:room", targetResult.roomSnapshot);
            socket.emit("world:system", { category: "System", message: `Primary target set to ${targetResult.targetName}.` });
            return;
        }

        const normalizedDirection = this._directionAliases.get(lowerVerb)
            ?? (this._allowedDirections.includes(lowerVerb) ? lowerVerb : "");

        if (normalizedDirection) {
            const moveCommand: MoveCommand = { direction: normalizedDirection };
            const moveResult = this._world.movePlayer(socket.id, moveCommand.direction);
            if ("error" in moveResult) {
                socket.emit("world:system", { category: "System", message: moveResult.error });
                return;
            }

            socket.leave(moveResult.fromRoomId);
            socket.join(moveResult.toRoomId);

            socket.emit("world:room", moveResult.roomSnapshot);
            socket.emit("world:system", { category: "System", message: `You move ${moveResult.direction}, you have entered ${moveResult.roomSnapshot.name}` });
            socket.to(moveResult.fromRoomId).emit("world:system", { category: "System", message: `${moveResult.playerName} leaves to the ${moveResult.direction}.` });
            socket.to(moveResult.toRoomId).emit("world:system", { category: "System", message: `${moveResult.playerName} arrives from the ${moveResult.direction}.` });
            return;
        }

        socket.emit("world:system", { category: "System", message: `Unknown command: ${trimmedCommand}` });
    }

    public setSocketServer(socketServer: SocketServer): void {
        this._socketServer = socketServer;
    }

    private stopAttacking(playerId: string): void {
        const attackTimeout = this._attackTimeouts.get(playerId);
        if (attackTimeout) {
            clearTimeout(attackTimeout);
            this._attackTimeouts.delete(playerId);
        }

        const player = this._world.getPlayer(playerId);
        if (player) {
            player.isAttacking = false;
        }
    }

}
