import { Server as SocketIOServer } from "socket.io";
import { NodeHttpServer, SocketServer } from "../types";

export class SocketServerFactory   {

    public static createSocketIOServer(server: NodeHttpServer): SocketServer {
        return new SocketIOServer(server);
    }

}

