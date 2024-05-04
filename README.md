## IC8L Backend

Teachstack:

1. Framework: Fastify
2. Database: Postgres
3. Authentication & Realtime: Supabase

### Commands

- Format schema SQL files: `sqlfluff format schema.sql --dialect postgres`
- Start Redis (without disk save): `redis-server --save "" --appendonly no`
