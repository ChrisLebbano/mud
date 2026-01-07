import { expect } from "chai";
import { UserRepository } from "../../src/user-repository";

class FakePool {

    private _executed: Array<{ parameters: unknown[]; sql: string }> = [];
    private _nextResult: unknown = [];

    public async execute(sql: string, parameters: unknown[]): Promise<[unknown, unknown]> {
        this._executed.push({ parameters, sql });
        return [this._nextResult, undefined];
    }

    public get executed(): Array<{ parameters: unknown[]; sql: string }> {
        return this._executed;
    }

    public setNextResult(result: unknown): void {
        this._nextResult = result;
    }

}

describe(`[Class] UserRepository`, () => {

    describe(`[Method] createUser`, () => {
        it(`should insert a user record`, async () => {
            const fakePool = new FakePool();
            fakePool.setNextResult({ insertId: 42 });
            const repository = new UserRepository({
                database: "mud",
                host: "127.0.0.1",
                password: "mud_password",
                port: 3306,
                user: "mud_user"
            }, fakePool as never);

            const createdUser = await repository.createUser("player", "hashed");

            expect(createdUser).to.deep.equal({
                id: 42,
                passwordHash: "hashed",
                username: "player"
            });
            expect(fakePool.executed[0]).to.deep.equal({
                parameters: ["player", "hashed"],
                sql: "INSERT INTO users (username, password_hash) VALUES (?, ?)"
            });
        });
    });

    describe(`[Method] findUserByUsername`, () => {
        it(`should return null when user is missing`, async () => {
            const fakePool = new FakePool();
            fakePool.setNextResult([]);
            const repository = new UserRepository({
                database: "mud",
                host: "127.0.0.1",
                password: "mud_password",
                port: 3306,
                user: "mud_user"
            }, fakePool as never);

            const user = await repository.findUserByUsername("missing");

            expect(user).to.equal(null);
        });

        it(`should return a user record when found`, async () => {
            const fakePool = new FakePool();
            fakePool.setNextResult([{ id: 7, password_hash: "hash", username: "player" }]);
            const repository = new UserRepository({
                database: "mud",
                host: "127.0.0.1",
                password: "mud_password",
                port: 3306,
                user: "mud_user"
            }, fakePool as never);

            const user = await repository.findUserByUsername("player");

            expect(user).to.deep.equal({
                id: 7,
                passwordHash: "hash",
                username: "player"
            });
        });
    });

    describe(`[Method] listCharacterNamesByUserId`, () => {
        it(`should return character names`, async () => {
            const fakePool = new FakePool();
            fakePool.setNextResult([{ name: "Hero" }, { name: "Mage" }]);
            const repository = new UserRepository({
                database: "mud",
                host: "127.0.0.1",
                password: "mud_password",
                port: 3306,
                user: "mud_user"
            }, fakePool as never);

            const names = await repository.listCharacterNamesByUserId(3);

            expect(names).to.deep.equal(["Hero", "Mage"]);
        });
    });

});

