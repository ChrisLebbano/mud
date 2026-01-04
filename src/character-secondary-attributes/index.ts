export class CharacterSecondaryAttributes {

    private _attackDelaySeconds: number;
    private _currentHealth: number;
    private _damage: number;
    private _maxHealth: number;

    constructor(maxHealth: number, attackDelaySeconds?: number, damage?: number) {
        this._attackDelaySeconds = attackDelaySeconds ?? 5;
        this._damage = damage ?? 10;
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
    }

    public get attackDelaySeconds(): number {
        return this._attackDelaySeconds;
    }

    public set attackDelaySeconds(attackDelaySeconds: number) {
        this._attackDelaySeconds = attackDelaySeconds;
    }

    public applyDamage(amount: number): number {
        this._currentHealth -= amount;
        return this._currentHealth;
    }

    public get currentHealth(): number {
        return this._currentHealth;
    }

    public set currentHealth(currentHealth: number) {
        this._currentHealth = currentHealth;
    }

    public get damage(): number {
        return this._damage;
    }

    public set damage(damage: number) {
        this._damage = damage;
    }

    public get isAlive(): boolean {
        return this._currentHealth > 0;
    }

    public get maxHealth(): number {
        return this._maxHealth;
    }

}

