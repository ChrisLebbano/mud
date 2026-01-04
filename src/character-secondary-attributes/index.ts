export class CharacterSecondaryAttributes {

    private _attackDelaySeconds: number;
    private _currentHealth: number;
    private _attackDamage: number;
    private _maxHealth: number;

    constructor(maxHealth: number, attackDelaySeconds?: number, attackDamage?: number) {
        this._attackDelaySeconds = attackDelaySeconds ?? 5;
        this._attackDamage = attackDamage ?? 10;
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
    }

    public applyDamage(amount: number): number {
        this._currentHealth -= amount;
        return this._currentHealth;
    }

    public get attackDelaySeconds(): number {
        return this._attackDelaySeconds;
    }

    public set attackDelaySeconds(attackDelaySeconds: number) {
        this._attackDelaySeconds = attackDelaySeconds;
    }

    public get currentHealth(): number {
        return this._currentHealth;
    }

    public set currentHealth(currentHealth: number) {
        this._currentHealth = currentHealth;
    }

    public get attackDamage(): number {
        return this._attackDamage;
    }

    public set attackDamage(attackDamage: number) {
        this._attackDamage = attackDamage;
    }

    public get isAlive(): boolean {
        return this._currentHealth > 0;
    }

    public get maxHealth(): number {
        return this._maxHealth;
    }

}
