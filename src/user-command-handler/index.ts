import { type ChatMessage, type GameSocket, type MoveCommand, type RoomSnapshot, type SocketServer } from "../types";
import { World } from "../world";

export class UserCommandHandler {

    private _allowedDirections: string[];
    private _attackTimeouts: Map<string, NodeJS.Timeout>;
    private _nextAttackTimes: Map<string, number>;
    private _socketServer?: SocketServer;
    private _world: World;

    constructor(world: World) {
        this._allowedDirections = ["north", "south", "east", "west"];
        this._attackTimeouts = new Map();
        this._nextAttackTimes = new Map();
        this._world = world;
    }

    public get allowedDirections(): string[] {
        return this._allowedDirections;
    }

    public handleCommand(socket: GameSocket, command: string): void {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            return;
        }

        const [verb, ...rest] = trimmedCommand.split(" ");
        const lowerVerb = verb.toLowerCase();

        if (lowerVerb === "say") {
            const message = rest.join(" ");
            const sayResult = this._world.say(socket.id, message);
            if ("error" in sayResult) {
                socket.emit("world:system", { category: "System", message: sayResult.error });
                return;
            }

            const chatMessage: ChatMessage = sayResult.chatMessage;
            this._socketServer?.to(chatMessage.roomId).emit("world:chat", chatMessage);
            const trimmedMessage = message.trim();
            const hailMatch = trimmedMessage.match(/^hail\s+(.+)/i);
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
            return;
        }

        if (lowerVerb === "look") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            const roomSnapshot: RoomSnapshot = this._world.getRoomSnapshot(player.roomId, player.id);
            socket.emit("world:room", roomSnapshot);
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
                `Damage: ${secondaryAttributes.attackDamage}`,
                `Attack Delay: ${secondaryAttributes.attackDelaySeconds}s`,
                `Mana: ${attributes.mana}`
            ];
            const listMessage = listItems.join("\n");
            socket.emit("world:system", { category: "System", message: listMessage });
            return;
        }

        if (lowerVerb === "attack") {
            const player = this._world.getPlayer(socket.id);
            if (!player) {
                socket.emit("world:system", { category: "System", message: "Player not found." });
                return;
            }

            if (player.isAttacking) {
                this.stopAttacking(socket.id);
                socket.emit("world:system", { category: "System", message: "You stop attacking." });
                return;
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
                    return;
                }

                socket.emit("world:system", { category: "SelfDealingAttackDamage", message: `You hit ${attackResult.targetName} for ${attackResult.damage} damage.` });
                if (attackResult.targetPlayerId) {
                    this._socketServer?.to(attackResult.targetPlayerId).emit("world:system", {
                        category: "SelfRecieveAttackDamage",
                        message: `You are hit by ${attackResult.attackerName} for ${attackResult.damage} damage.`
                    });
                }
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
                        return;
                    }

                    socket.emit("world:system", { category: "SelfDealingAttackDamage", message: `You hit ${nextAttackResult.targetName} for ${nextAttackResult.damage} damage.` });
                    if (nextAttackResult.targetPlayerId) {
                        this._socketServer?.to(nextAttackResult.targetPlayerId).emit("world:system", {
                            category: "SelfRecieveAttackDamage",
                            message: `You are hit by ${nextAttackResult.attackerName} for ${nextAttackResult.damage} damage.`
                        });
                    }
                    this._nextAttackTimes.set(socket.id, Date.now() + scheduledAttackDelayMs);
                    scheduleAttack();
                }, remainingDelay);

                this._attackTimeouts.set(socket.id, nextTimeout);
            };

            scheduleAttack();
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

        const isMoveVerb = lowerVerb === "move" || lowerVerb === "go";
        const isDirectMove = this.allowedDirections.includes(lowerVerb);
        const direction = isMoveVerb ? rest[0] : (isDirectMove ? lowerVerb : "");
        const normalizedDirection = direction ? direction.toLowerCase() : "";

        if (isMoveVerb && direction && !this.allowedDirections.includes(normalizedDirection)) {
            socket.emit("world:system", { category: "System", message: `${direction} is not a direction, please use 'north', 'south', 'east', or 'west'` });
            return;
        }

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

}
