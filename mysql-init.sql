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


CREATE TABLE IF NOT EXISTS characters (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(100) NOT NULL,
  race_name VARCHAR(100) NOT NULL DEFAULT '',
  class_name VARCHAR(100) NOT NULL DEFAULT '',
  user_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_characters_name (name),
  KEY index_characters_user_id (user_id),
  CONSTRAINT fk_characters_users FOREIGN KEY (user_id) REFERENCES users (id)
);


CREATE TABLE IF NOT EXISTS races (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_races_name (name)
);


CREATE TABLE IF NOT EXISTS characterClasses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  attributeModifiers JSON NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_character_classes_name (name)
);

CREATE TABLE IF NOT EXISTS items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  maxCount INT NOT NULL DEFAULT 1,
  type ENUM('POTION', 'FOOD', 'DRINK') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_items_name (name)
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

INSERT INTO items (name, description, type)
VALUES
  ('slice of bread', 'A simple slice of bread.', 'FOOD'),
  ('water flask', 'A leather-bound flask filled with water.', 'DRINK');

