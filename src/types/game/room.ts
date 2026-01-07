import { type CharacterAttributesSnapshot } from "./character-attributes";
import { type CharacterClassSnapshot } from "./character-class";
import { type RaceSnapshot } from "./race";

export interface NonPlayerCharacterSnapshot {
    id: string;
    name: string;
}

export interface TargetVitalsSnapshot {
    currentHealth: number;
    maxHealth: number;
}

export interface PlayerSnapshot {
    attributes: CharacterAttributesSnapshot;
    characterClass: CharacterClassSnapshot;
    currentHealth: number;
    id: string;
    maxHealth: number;
    name: string;
    primaryTargetName?: string;
    primaryTargetVitals?: TargetVitalsSnapshot;
    race: RaceSnapshot;
    roomId: string;
}

export interface ZoneSnapshot {
    id: string;
    name: string;
}

export interface RoomSnapshot {
    description: string;
    exits: string[];
    id: string;
    name: string;
    nonPlayerCharacters: NonPlayerCharacterSnapshot[];
    player?: PlayerSnapshot;
    players: string[];
    zone: ZoneSnapshot;
}

