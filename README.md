This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backups

The database is a free MongoDB Atlas cluster, which keeps no backups of its own.
`.github/workflows/backup.yml` exports every collection of the `test` database
each week (Sunday 16:17 UTC, or on demand from the Actions tab), encrypts the
archive with `BACKUP_PASSPHRASE` and keeps it as a workflow artifact for 90 days.
The repository is public, so the artifact is only safe because it is encrypted:
keep the passphrase in a password manager, not in the repository.

Repository secrets: `MONGODB_URI` (read access is enough) and `BACKUP_PASSPHRASE`.

To restore, follow the steps at the top of `scripts/restore-backup.mjs`. It
writes nothing without `--apply`, and won't overwrite a collection that has
documents unless given `--replace`.
