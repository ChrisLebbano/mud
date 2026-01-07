export type MessageCategory = "CharacterSpeech" | "RoomDescription" | "SelfDealingAttackDamage" | "SelfRecieveAttackDamage" | "Shout" | "System";

export interface MessagePayload {
    category: MessageCategory;
    message: string;
}

export interface ChatMessage extends MessagePayload {
    playerId: string;
    playerName: string;
    roomId: string;
}

