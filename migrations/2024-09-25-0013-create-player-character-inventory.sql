CREATE TABLE IF NOT EXISTS playerCharacterInventory (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    playerCharacterId BIGINT UNSIGNED NOT NULL,
    playerCharacterName VARCHAR(100) NOT NULL,
    itemId BIGINT UNSIGNED NOT NULL,
    slotIndex TINYINT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_player_character_inventory_slot (playerCharacterId, slotIndex),
    KEY index_player_character_inventory_item_id (itemId),
    CONSTRAINT fk_player_character_inventory_character FOREIGN KEY (playerCharacterId) REFERENCES playerCharacters (id),
    CONSTRAINT fk_player_character_inventory_item_def FOREIGN KEY (itemId) REFERENCES itemDefs (id),
    CONSTRAINT chk_player_character_inventory_slot_index CHECK (slotIndex BETWEEN 1 AND 8)
);
