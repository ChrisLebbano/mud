CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  loginToken VARCHAR(255) NULL,
  lastLoginOn DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_users_email (email),
  UNIQUE KEY unique_users_username (username)
);


CREATE TABLE IF NOT EXISTS playerCharacters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  name VARCHAR(100) NOT NULL,
  race_name VARCHAR(100) NOT NULL DEFAULT '',
  class_name VARCHAR(100) NOT NULL DEFAULT '',
  user_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_player_characters_name (name),
  KEY index_player_characters_user_id (user_id),
  CONSTRAINT fk_player_characters_users FOREIGN KEY (user_id) REFERENCES users (id)
);


CREATE TABLE IF NOT EXISTS races (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  base_health INT NOT NULL DEFAULT 10,
  player_character_allowed TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY unique_races_name (name)
);


CREATE TABLE IF NOT EXISTS characterClasses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  base_health INT NOT NULL DEFAULT 10,
  attributeModifiers JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_character_classes_name (name)
);

CREATE TABLE IF NOT EXISTS itemDefs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  maxCount INT NOT NULL DEFAULT 1,
  type ENUM('POTION', 'FOOD', 'DRINK') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_item_defs_name (name)
);

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

CREATE TABLE IF NOT EXISTS nonPlayerCharacters (
  id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  room_id VARCHAR(100) NOT NULL,
  class_id BIGINT UNSIGNED NOT NULL,
  race_key VARCHAR(100) NOT NULL,
  hail_response TEXT NULL,
  max_health INT NULL,
  PRIMARY KEY (id),
  KEY index_non_player_characters_room_id (room_id),
  KEY index_non_player_characters_race_key (race_key)
);

INSERT INTO races (name, description)
VALUES
  ('Human', NULL),
  ('Dark Elf', NULL),
  ('Dwarf', NULL),
  ('Gnome', NULL),
  ('Half-Elf', NULL),
  ('High Elf', NULL),
  ('Troll', NULL),
  ('Wood Elf', NULL);

INSERT INTO characterClasses (id, name, description, attributeModifiers)
VALUES
  (
    1,
    'Warrior',
    'Disciplined fighters who excel with weapons and armor.',
    JSON_OBJECT(
      'strength', 2,
      'agility', 1,
      'dexterity', 1,
      'perception', 0,
      'constitution', 2,
      'wisdom', -1,
      'intelligence', -1,
      'charisma', -1,
      'resolve', 1,
      'health', 6,
      'mana', -2
    )
  ),
  (
    2,
    'Cleric',
    'Devout healers and protectors who channel divine power.',
    JSON_OBJECT(
      'strength', -1,
      'agility', 0,
      'dexterity', 0,
      'perception', 1,
      'constitution', 1,
      'wisdom', 2,
      'intelligence', 2,
      'charisma', 1,
      'resolve', 2,
      'health', 4,
      'mana', 6
    )
  );

INSERT INTO itemDefs (name, description, type)
VALUES
  ('slice of bread', 'A simple slice of bread.', 'FOOD'),
  ('water flask', 'A leather-bound flask filled with water.', 'DRINK');

INSERT INTO nonPlayerCharacters (id, name, room_id, class_id, race_key, hail_response, max_health)
VALUES
  (
    'npc-guide',
    'Terminal Guide',
    'atrium',
    2,
    'human',
    'Move [north] to visit the training grounds and test your skills.',
    NULL
  ),
  (
    'npc-rat',
    'a rat',
    'training-grounds',
    1,
    'creature',
    NULL,
    20
  ),
  (
    'npc-snake',
    'a snake',
    'training-grounds',
    1,
    'creature',
    NULL,
    20
  );

