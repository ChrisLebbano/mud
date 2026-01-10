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

