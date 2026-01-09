import { ITEM_TYPE } from "../../../game/types/item-type";
import { RowDataPacket } from "mysql2";

export interface ItemRecord {
    description: string | null;
    id: number;
    maxCount: number;
    name: string;
    type: ITEM_TYPE;
}

export interface ItemRow extends RowDataPacket {
    description: string | null;
    id: number;
    maxCount: number;
    name: string;
    type: ITEM_TYPE;
}

