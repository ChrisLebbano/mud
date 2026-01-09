ALTER TABLE races
    ADD COLUMN race_key VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN strength INT NOT NULL DEFAULT 10,
    ADD COLUMN agility INT NOT NULL DEFAULT 10,
    ADD COLUMN dexterity INT NOT NULL DEFAULT 10,
    ADD COLUMN perception INT NOT NULL DEFAULT 10,
    ADD COLUMN constitution INT NOT NULL DEFAULT 10,
    ADD COLUMN wisdom INT NOT NULL DEFAULT 10,
    ADD COLUMN intelligence INT NOT NULL DEFAULT 10,
    ADD COLUMN charisma INT NOT NULL DEFAULT 10,
    ADD COLUMN resolve INT NOT NULL DEFAULT 10,
    ADD COLUMN health INT NOT NULL DEFAULT 10,
    ADD COLUMN mana INT NOT NULL DEFAULT 10;

UPDATE races
SET race_key = LOWER(REPLACE(name, ' ', '-'))
WHERE race_key = '';

UPDATE races
SET
    description = 'Adaptable and ambitious inhabitants of the cities.',
    strength = 10,
    agility = 10,
    dexterity = 10,
    perception = 10,
    constitution = 10,
    wisdom = 10,
    intelligence = 10,
    charisma = 12,
    resolve = 10,
    health = 42,
    mana = 22
WHERE race_key = 'human';

INSERT INTO races (name, description, race_key, strength, agility, dexterity, perception, constitution, wisdom, intelligence, charisma, resolve, health, mana)
SELECT 'Creature', 'Wild denizens that stalk the edges of civilization.', 'creature', 12, 11, 9, 11, 12, 8, 8, 6, 9, 46, 16
WHERE NOT EXISTS (SELECT 1 FROM races WHERE race_key = 'creature');

ALTER TABLE races
    ADD UNIQUE KEY unique_races_race_key (race_key);

