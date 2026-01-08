import { type RaceRecord } from "./race";

export interface RaceRepositoryClient {
    findAll(): Promise<RaceRecord[]>;
}

