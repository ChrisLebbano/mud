import { type RaceRecord } from "../types/race";
import { type RaceRepositoryClient } from "../types/race-repository";

export class StaticRaceRepository implements RaceRepositoryClient {

    private _races: RaceRecord[];

    constructor(races: RaceRecord[]) {
        this._races = races;
    }

    public findAll(): Promise<RaceRecord[]> {
        return Promise.resolve(this._races);
    }

}

