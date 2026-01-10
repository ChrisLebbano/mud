export class CharacterSecondaryAttributes {

    private _attackDelaySeconds: number;
    private _currentHealth: number;
    private _currentExperience: number;
    private _attackDamage: number;
    private _experienceUntilNextLevel: number;
    private _maxHealth: number;

    constructor(
        maxHealth: number,
        attackDelaySeconds?: number,
        attackDamage?: number,
        currentExperience?: number,
        experienceUntilNextLevel?: number
    ) {
        this._attackDelaySeconds = attackDelaySeconds ?? 5;
        this._attackDamage = attackDamage ?? 10;
        this._currentExperience = currentExperience ?? 0;
        this._experienceUntilNextLevel = experienceUntilNextLevel ?? 1000;
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
    }

    public applyDamage(amount: number): number {
        this._currentHealth -= amount;
        return this._currentHealth;
    }

    public get attackDamage(): number {
        return this._attackDamage;
    }

    public set attackDamage(attackDamage: number) {
        this._attackDamage = attackDamage;
    }

    public get attackDelaySeconds(): number {
        return this._attackDelaySeconds;
    }

    public set attackDelaySeconds(attackDelaySeconds: number) {
        this._attackDelaySeconds = attackDelaySeconds;
    }

    public get currentExperience(): number {
        return this._currentExperience;
    }

    public set currentExperience(currentExperience: number) {
        this._currentExperience = currentExperience;
    }

    public get currentHealth(): number {
        return this._currentHealth;
    }

    public set currentHealth(currentHealth: number) {
        this._currentHealth = currentHealth;
    }

    public get experienceUntilNextLevel(): number {
        return this._experienceUntilNextLevel;
    }

    public set experienceUntilNextLevel(experienceUntilNextLevel: number) {
        this._experienceUntilNextLevel = experienceUntilNextLevel;
    }

    public get isAlive(): boolean {
        return this._currentHealth > 0;
    }

    public get maxHealth(): number {
        return this._maxHealth;
    }

    public setMaxHealth(maxHealth: number, shouldResetCurrentHealth: boolean): void {
        this._maxHealth = maxHealth;
        if (shouldResetCurrentHealth || this._currentHealth > maxHealth) {
            this._currentHealth = maxHealth;
        }
    }

}

