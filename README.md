A server to connect to a MUD game world.

## Database Migrations

Create new migration files under `data/migrations` using the naming convention
`YYYYMMDDHHMMSS_description.sql` (timestamp prefix plus a short snake-case description).
Apply migrations locally by running the migration runner located at
`src/migration-runner/index.ts` (for example, via whatever script or direct invocation
is configured for your environment). When running in containers, migrations are
executed on startup by the same migration runner, ensuring the database schema is
up to date before the application begins serving.
