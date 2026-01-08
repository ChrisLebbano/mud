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

INSERT INTO characterClasses (name, description)
VALUES
  ('Fighter', NULL),
  ('Knight', NULL),
  ('Dark Knight', NULL),
  ('Bard', NULL),
  ('Druid', NULL),
  ('Enchanter', NULL),
  ('Monk', NULL),
  ('Ranger', NULL),
  ('Wizard', NULL),
  ('Necromancer', NULL),
  ('Cleric', NULL);

INSERT INTO items (name, description, type)
VALUES
  ('slice of bread', 'A simple slice of bread.', 'FOOD'),
  ('water flask', 'A leather-bound flask filled with water.', 'DRINK');

