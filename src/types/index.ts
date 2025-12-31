import { Server } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';

export interface ServerConfig {
    port: number;
}

export type NodeHttpServer = Server;
export type SocketServer = SocketIOServer;