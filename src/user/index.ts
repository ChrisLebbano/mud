import { type UserAuthFlowState } from "../types";

export class User {

    private _authFlowState: UserAuthFlowState;
    private _authenticated: boolean;
    private _pendingPassword?: string;
    private _pendingUsername?: string;
    private _playerCharacterNames: string[];
    private _username?: string;

    constructor() {
        this._authFlowState = "AwaitingChoice";
        this._authenticated = false;
        this._playerCharacterNames = [];
    }

    public get authFlowState(): UserAuthFlowState {
        return this._authFlowState;
    }

    public set authFlowState(authFlowState: UserAuthFlowState) {
        this._authFlowState = authFlowState;
        this._authenticated = authFlowState === "Authenticated";
    }

    public get authenticated(): boolean {
        return this._authenticated;
    }

    public clearPendingCredentials(): void {
        this._pendingPassword = undefined;
        this._pendingUsername = undefined;
    }

    public get pendingPassword(): string | undefined {
        return this._pendingPassword;
    }

    public set pendingPassword(pendingPassword: string | undefined) {
        this._pendingPassword = pendingPassword;
    }

    public get pendingUsername(): string | undefined {
        return this._pendingUsername;
    }

    public set pendingUsername(pendingUsername: string | undefined) {
        this._pendingUsername = pendingUsername;
    }

    public get playerCharacterNames(): string[] {
        return this._playerCharacterNames;
    }

    public set playerCharacterNames(playerCharacterNames: string[]) {
        this._playerCharacterNames = playerCharacterNames;
    }

    public get username(): string | undefined {
        return this._username;
    }

    public set username(username: string | undefined) {
        this._username = username;
    }

}

