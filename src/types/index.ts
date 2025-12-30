export interface ServerConfig {
    port: number;
}

export interface ServerFactory {
    createServer(): ServerInstance;
}

export interface ServerInstance {
    close(callback?: (error?: Error) => void): void;
    listen(port: number, callback?: () => void): void;
}

export interface SocketServerFactory {
    createServer(server: ServerInstance): SocketServerInstance;
}

export interface SocketServerInstance {
    close(callback?: (error?: Error) => void): void;
}
