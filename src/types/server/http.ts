import { type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { Server as SocketIOServer } from "socket.io";

export type HttpRequestHandler = (request: IncomingMessage, response: ServerResponse) => void;
export type NodeHttpServer = Server;
export type SocketServer = SocketIOServer;

