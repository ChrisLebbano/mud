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
