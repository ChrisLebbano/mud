ALTER TABLE races
    ADD COLUMN player_character_allowed TINYINT(1) NOT NULL DEFAULT 1;

UPDATE races
SET player_character_allowed = 0
WHERE race_key = 'creature';

