import { NodeHttpServerFactory } from "../node-http-server-factory";
import { ServerRouter } from "../server-router";
import { SocketServerFactory } from "../socket-server-factory";
import { type GameSocket, type NodeHttpServer, type ServerConfig, type SocketServer, type UserAuthenticationResult } from "../types";
import { User } from "../user";
import { UserAuthenticationService } from "../user-authentication-service";
import { UserCommandHandler } from "../user-command-handler";
import { World } from "../world";

export class Server {

    private _httpServer?: NodeHttpServer;
    private _serverConfig: ServerConfig;
    private _serverRouter: ServerRouter;
    private _socketServer?: SocketServer;
    private _userAuthenticationService: UserAuthenticationService;
    private _userCommandHandler: UserCommandHandler;
    private _users: Map<string, User>;
    private _world: World;

    constructor(
        serverConfig: ServerConfig,
        serverRouter: ServerRouter,
        world: World,
        userAuthenticationService: UserAuthenticationService,
        userCommandHandler?: UserCommandHandler
    ) {
        this._serverConfig = serverConfig;
        this._serverRouter = serverRouter;
        this._userAuthenticationService = userAuthenticationService;
        this._userCommandHandler = userCommandHandler ? userCommandHandler : new UserCommandHandler(world);
        this._users = new Map();
        this._world = world;
    }

    private configureSocketServer(): void {
        if (!this._socketServer) {
            return;
        }

        this._socketServer.on("connection", (socket) => {
            const user = new User();
            this._users.set(socket.id, user);
            socket.emit("world:system", {
                category: "System",
                message: "Welcome! Please type 'login' or 'signup' to continue."
            });

            socket.on("disconnect", () => {
                this._users.delete(socket.id);
                const removedPlayer = this._world.removePlayer(socket.id);
                if (removedPlayer) {
                    socket.to(removedPlayer.roomId).emit("world:system", { category: "System", message: `${removedPlayer.playerName} has left the room.` });
                }
            });

            socket.on("submit", (command) => {
                console.log(`[INFO] Received command: ${command}`);
                const currentUser = this._users.get(socket.id);
                if (!currentUser) {
                    socket.emit("world:system", { category: "System", message: "User session not found." });
                    return;
                }

                if (currentUser.authenticated) {
                    this._userCommandHandler.handleCommand(socket, command);
                    return;
                }

                void this.handleAuthenticationCommand(socket, currentUser, command);
            });
        });
    }

    private async handleAuthenticationCommand(socket: GameSocket, user: User, command: string): Promise<void> {
        const trimmedCommand = command.trim();
        if (!trimmedCommand) {
            return;
        }

        if (user.authFlowState === "AwaitingChoice") {
            const lowerCommand = trimmedCommand.toLowerCase();
            if (lowerCommand === "login") {
                user.authFlowState = "LoginUsername";
                socket.emit("world:system", { category: "System", message: "Enter your username." });
                return;
            }

            if (lowerCommand === "signup") {
                user.authFlowState = "SignupUsername";
                socket.emit("world:system", { category: "System", message: "Choose a username." });
                return;
            }

            socket.emit("world:system", { category: "System", message: "Please type 'login' or 'signup' to continue." });
            return;
        }

        if (user.authFlowState === "LoginUsername") {
            user.pendingUsername = trimmedCommand;
            user.authFlowState = "LoginPassword";
            socket.emit("world:system", { category: "System", message: "Enter your password." });
            return;
        }

        if (user.authFlowState === "LoginPassword") {
            const pendingUsername = user.pendingUsername;
            if (!pendingUsername) {
                user.authFlowState = "AwaitingChoice";
                socket.emit("world:system", { category: "System", message: "Please type 'login' or 'signup' to continue." });
                return;
            }

            const authResult = await this._userAuthenticationService.loginUser(pendingUsername, trimmedCommand);
            if (!authResult) {
                user.clearPendingCredentials();
                user.authFlowState = "AwaitingChoice";
                socket.emit("world:system", {
                    category: "System",
                    message: "Invalid credentials. Please type 'login' or 'signup' to continue."
                });
                return;
            }

            user.clearPendingCredentials();
            this.handleAuthenticatedUser(socket, user, authResult);
            return;
        }

        if (user.authFlowState === "SignupUsername") {
            user.pendingUsername = trimmedCommand;
            user.authFlowState = "SignupPassword";
            socket.emit("world:system", { category: "System", message: "Choose a password." });
            return;
        }

        if (user.authFlowState === "SignupPassword") {
            user.pendingPassword = trimmedCommand;
            user.authFlowState = "SignupConfirmPassword";
            socket.emit("world:system", { category: "System", message: "Confirm your password." });
            return;
        }

        if (user.authFlowState === "SignupConfirmPassword") {
            const pendingUsername = user.pendingUsername;
            const pendingPassword = user.pendingPassword;
            if (!pendingUsername || !pendingPassword || trimmedCommand !== pendingPassword) {
                user.clearPendingCredentials();
                user.authFlowState = "AwaitingChoice";
                socket.emit("world:system", {
                    category: "System",
                    message: "Password mismatch. Please type 'login' or 'signup' to continue."
                });
                return;
            }

            const authResult = await this._userAuthenticationService.signupUser(pendingUsername, pendingPassword);
            if (!authResult) {
                user.clearPendingCredentials();
                user.authFlowState = "AwaitingChoice";
                socket.emit("world:system", {
                    category: "System",
                    message: "Username already exists. Please type 'login' or 'signup' to continue."
                });
                return;
            }

            user.clearPendingCredentials();
            this.handleAuthenticatedUser(socket, user, authResult);
            return;
        }
    }

    private handleAuthenticatedUser(socket: GameSocket, user: User, authResult: UserAuthenticationResult): void {
        user.authFlowState = "Authenticated";
        user.playerCharacterNames = authResult.playerCharacterNames;
        user.username = authResult.username;

        socket.emit("auth:token", {
            playerCharacterNames: authResult.playerCharacterNames,
            token: authResult.authToken,
            username: authResult.username
        });

        const joinResult = this._world.addPlayer(socket.id, authResult.username);
        socket.join(joinResult.roomId);
        socket.emit("world:room", joinResult.roomSnapshot);
        socket.emit("world:system", { category: "System", message: `Welcome, ${authResult.username}.` });
        socket.to(joinResult.roomId).emit("world:system", { category: "System", message: joinResult.systemMessage });
    }

    public start(): NodeHttpServer {
        this._httpServer = NodeHttpServerFactory.createServer((request, response) => {
            this._serverRouter.handle(request, response);
        });

        this._httpServer.on("listening", () => {
            this._socketServer = SocketServerFactory.createSocketIOServer(this._httpServer as NodeHttpServer);
            this._userCommandHandler.setSocketServer(this._socketServer);
            this.configureSocketServer();
            console.log(`[INFO] Socket Server started`);
        });

        this._httpServer.listen(this._serverConfig.port, () => {
            console.log(`[INFO] Server started on port ${this._serverConfig.port}`);
        });

        return this._httpServer;
    }

}

