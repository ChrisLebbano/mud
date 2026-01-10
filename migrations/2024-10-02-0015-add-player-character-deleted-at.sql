ALTER TABLE playerCharacters
ADD COLUMN deleted_at DATETIME NULL AFTER created_at;
