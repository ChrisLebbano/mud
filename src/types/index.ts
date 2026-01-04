import { type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { Server as SocketIOServer } from "socket.io";

export interface CharacterAttributesSnapshot {
    agility: number;
    charisma: number;
    constitution: number;
    dexterity: number;
    health: number;
    intelligence: number;
    mana: number;
    perception: number;
    resolve: number;
    strength: number;
    wisdom: number;
}

export type MessageCategory = "CharacterSpeech" | "SelfDealingAttackDamage" | "SelfRecieveAttackDamage" | "System";

export interface MessagePayload {
    category: MessageCategory;
    message: string;
}

export interface ChatMessage extends MessagePayload {
    playerId: string;
    playerName: string;
    roomId: string;
}

export interface GameSocket {
    emit: (event: string, payload: unknown) => void;
    id: string;
    join: (roomId: string) => void;
    leave: (roomId: string) => void;
    to: (roomId: string) => { emit: (event: string, payload: unknown) => void };
}

export interface MoveCommand {
    direction: string;
}

export interface NonPlayerCharacterSnapshot {
    id: string;
    name: string;
}

export interface PlayerSnapshot {
    attributes: CharacterAttributesSnapshot;
    currentHealth: number;
    id: string;
    maxHealth: number;
    name: string;
    primaryTargetName?: string;
    primaryTargetVitals?: TargetVitalsSnapshot;
    roomId: string;
}

export interface TargetVitalsSnapshot {
    currentHealth: number;
    maxHealth: number;
}

export interface ZoneSnapshot {
    id: string;
    name: string;
}

export interface RoomSnapshot {
    description: string;
    exits: string[];
    id: string;
    name: string;
    nonPlayerCharacters: NonPlayerCharacterSnapshot[];
    player?: PlayerSnapshot;
    players: string[];
    zone: ZoneSnapshot;
}

export interface ServerConfig {
    port: number;
}

export interface WorldData {
    startingRoomId: string;
    startingZoneId: string;
    zones: WorldZoneData[];
}

export interface WorldNonPlayerCharacterData {
    hailResponse?: string;
    id: string;
    maxHealth?: number;
    name: string;
}

export interface WorldRoomData {
    description: string;
    exits: Record<string, string>;
    id: string;
    name: string;
    nonPlayerCharacters?: WorldNonPlayerCharacterData[];
}

export interface WorldZoneData {
    id: string;
    name: string;
    rooms: WorldRoomData[];
    startingRoomId: string;
}

export type HttpRequestHandler = (request: IncomingMessage, response: ServerResponse) => void;
export type NodeHttpServer = Server;
export type SocketServer = SocketIOServer;

