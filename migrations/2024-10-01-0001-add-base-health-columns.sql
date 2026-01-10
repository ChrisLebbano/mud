ALTER TABLE races
    ADD COLUMN base_health INT NOT NULL DEFAULT 10;

UPDATE races
SET base_health = 10;

ALTER TABLE characterClasses
    ADD COLUMN base_health INT NOT NULL DEFAULT 10;

UPDATE characterClasses
SET base_health = 10;

