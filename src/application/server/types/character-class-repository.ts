import { type CharacterClassRecord } from "./character-class";

export interface CharacterClassRepositoryClient {
    findAll(): Promise<CharacterClassRecord[]>;
}

