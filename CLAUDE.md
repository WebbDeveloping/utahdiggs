@AGENTS.md

# Live database — do not write from this machine

Local development uses the live production database (`db.prisma.io`). There is no development database. Writes from a laptop change production.

Never run, suggest, retry, or re-add any of these:

- `prisma migrate` (`migrate dev`, `migrate deploy`, `migrate reset`, and the rest of `migrate`)
- `prisma db push`, `prisma db seed`, `prisma db execute`
- `prisma studio` (it edits live rows)
- `tsx prisma/seed.ts`
- `tsx scripts/import-airtable.ts`
- `tsx scripts/sync-airtable.ts`
- `tsx scripts/geocode-listings.ts`
- `tsx scripts/upload-agreement-templates.ts`
- `tsx scripts/seed-agreement-templates.ts`
- `tsx scripts/seed-email-templates.ts`

The npm scripts for those commands were removed on purpose. Do not put them back.

`src/lib/refuse-live-database-write.ts` exits before those commands can change data. Do not edit that file, its call sites, or `prisma.config.ts` to get past the refusal. Do not set an environment variable to override it. If a command prints `Refusing to run`, stop and tell the user. Do not look for another way to run it.

`npm run dev`, `npm test`, `npm run lint`, `npm run db:generate`, and `prisma generate` / `prisma validate` do not change production data. Schema changes and data loads are done outside local agent sessions.
