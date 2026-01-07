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

