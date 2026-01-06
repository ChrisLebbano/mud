import { Item } from "../item";
import { type InventorySlot, type InventoryStack } from "../types/inventory-slot";

export class Inventory {

    private _maxSlots: number;
    private _slots: InventorySlot[];

    constructor() {
        this._maxSlots = 8;
        this._slots = Array.from({ length: this._maxSlots }, () => null);
    }

    public addItem(item: Item, count: number): number {
        let remainingCount = count;

        this._slots.forEach((slot) => {
            if (!slot || slot.item !== item || slot.count >= item.maxCount) {
                return;
            }

            const availableSpace = item.maxCount - slot.count;
            const addedCount = Math.min(availableSpace, remainingCount);
            if (addedCount <= 0) {
                return;
            }

            slot.count += addedCount;
            remainingCount -= addedCount;
        });

        for (let slotIndex = 0; slotIndex < this._slots.length && remainingCount > 0; slotIndex += 1) {
            if (this._slots[slotIndex]) {
                continue;
            }

            const addedCount = Math.min(item.maxCount, remainingCount);
            const newSlot: InventoryStack = { count: addedCount, item };
            this._slots[slotIndex] = newSlot;
            remainingCount -= addedCount;
        }

        return remainingCount;
    }

    public get maxSlots(): number {
        return this._maxSlots;
    }

    public get slots(): InventorySlot[] {
        return this._slots;
    }

}
