INSERT INTO nonPlayerCharacters (id, name, room_id, class_id, race_key, hail_response, max_health)
VALUES
  (
    'npc-guide',
    'Terminal Guide',
    'atrium',
    2,
    'human',
    'Move [north] to visit the training grounds and test your skills.',
    NULL
  ),
  (
    'npc-rat',
    'a rat',
    'training-grounds',
    1,
    'creature',
    NULL,
    20
  ),
  (
    'npc-snake',
    'a snake',
    'training-grounds',
    1,
    'creature',
    NULL,
    20
  );

