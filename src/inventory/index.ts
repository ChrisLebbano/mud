import { InventorySlot } from "../types/inventory-slot";

export class Inventory {

    private _maxSlots: number;
    private _slots: InventorySlot[];

    constructor() {
        this._maxSlots = 8;
        this._slots = Array.from({ length: this._maxSlots }, () => null);
    }

    public get maxSlots(): number {
        return this._maxSlots;
    }

    public get slots(): InventorySlot[] {
        return this._slots;
    }

}
