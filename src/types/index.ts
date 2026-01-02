import { type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { Server as SocketIOServer } from "socket.io";

export interface ChatMessage {
    message: string;
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

export interface ZoneSnapshot {
    id: string;
    name: string;
}

export interface RoomSnapshot {
    description: string;
    exits: string[];
    id: string;
    name: string;
    players: string[];
    zone: ZoneSnapshot;
}

export interface ServerConfig {
    port: number;
}

export type HttpRequestHandler = (request: IncomingMessage, response: ServerResponse) => void;
export type NodeHttpServer = Server;
export type SocketServer = SocketIOServer;

