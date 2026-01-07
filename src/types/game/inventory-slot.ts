import { Item } from "../../game/item";

export interface InventoryStack {
    count: number;
    item: Item;
}

export type InventorySlot = InventoryStack | null;
