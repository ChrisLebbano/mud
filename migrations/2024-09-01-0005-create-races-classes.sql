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

