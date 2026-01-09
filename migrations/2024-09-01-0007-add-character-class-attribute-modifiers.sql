ALTER TABLE characterClasses
ADD COLUMN attributeModifiers JSON NULL;

UPDATE characterClasses
SET attributeModifiers = JSON_OBJECT(
    'strength', 0,
    'agility', 0,
    'dexterity', 0,
    'perception', 0,
    'constitution', 0,
    'wisdom', 0,
    'intelligence', 0,
    'charisma', 0,
    'resolve', 0,
    'health', 0,
    'mana', 0
)
WHERE attributeModifiers IS NULL;

ALTER TABLE characterClasses
MODIFY COLUMN attributeModifiers JSON NOT NULL;

