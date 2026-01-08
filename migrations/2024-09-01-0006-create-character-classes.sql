CREATE TABLE IF NOT EXISTS characterClasses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_character_classes_name (name)
);

