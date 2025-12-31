import { Server as SocketIOServer } from "socket.io";
import { type ServerInstance, type SocketServerFactory as SocketServerFactoryType, type SocketServerInstance } from "../types";

export class SocketServerFactory implements SocketServerFactoryType {

    public createServer(server: ServerInstance): SocketServerInstance {
        return new SocketIOServer(server);
    }

}

