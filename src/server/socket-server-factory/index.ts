import { type NodeHttpServer, type SocketServer } from "../../types";
import { Server as SocketIOServer } from "socket.io";

export class SocketServerFactory {

    public static createSocketIOServer(server: NodeHttpServer): SocketServer {
        return new SocketIOServer(server);
    }

}
