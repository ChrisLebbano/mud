import { type CharacterClassRecord } from "../types/character-class";
import { type CharacterClassRepositoryClient } from "../types/character-class-repository";

export class StaticCharacterClassRepository implements CharacterClassRepositoryClient {

    private _classes: CharacterClassRecord[];

    constructor(classes: CharacterClassRecord[]) {
        this._classes = classes;
    }

    public findAll(): Promise<CharacterClassRecord[]> {
        return Promise.resolve(this._classes);
    }

}

