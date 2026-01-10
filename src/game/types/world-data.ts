import { type CharacterAttributeValues } from "./character-attributes";
import { ITEM_TYPE } from "./item-type";

export interface WorldData {
    startingRoomId: string;
    startingZoneId: string;
    zones: WorldZoneData[];
}

export interface WorldItemData {
    description: string;
    maxCount?: number;
    name: string;
    type: ITEM_TYPE;
}

export interface WorldNonPlayerCharacterData {
    classId: string;
    hailResponse?: string;
    id: string;
    maxHealth?: number;
    name: string;
    raceId: string;
    roomId: string;
}

export interface WorldClassData {
    attributeModifiers: CharacterAttributeValues;
    baseHealth: number;
    description: string;
    id: string;
    name: string;
}

export interface WorldRoomData {
    description: string;
    exits: Record<string, string>;
    id: string;
    name: string;
}

export interface WorldZoneData {
    id: string;
    name: string;
    rooms: WorldRoomData[];
    startingRoomId: string;
}

export interface WorldRaceData {
    baseAttributes: CharacterAttributeValues;
    baseHealth: number;
    description: string;
    id: string;
    name: string;
}

export { ITEM_TYPE };

