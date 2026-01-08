CREATE TABLE IF NOT EXISTS items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    maxCount INT NOT NULL DEFAULT 1,
    type ENUM('POTION', 'FOOD', 'DRINK') NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_items_name (name)
);

INSERT INTO items (name, description, type)
VALUES
    ('slice of bread', 'A simple slice of bread.', 'FOOD'),
    ('water flask', 'A leather-bound flask filled with water.', 'DRINK');


