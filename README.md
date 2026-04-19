# Quizzy Front

Angular client for the Quizzy stack. It talks to the **Quizzam** API (`apiUrl` in `src/environments/environment.development.ts`). For anything except static UI work, **run the API before or alongside** this app.

## Prerequisites

- **Node.js** 20+ and **pnpm**
- **Quizzam** checked out next to this folder (`../quizzam`) and configured (see [Quizzam README](../quizzam/README.md))

## Development: API + front

1. **Start the API** (pick one workflow from the Quizzam docs):

   - From `../quizzam`: `pnpm exec nx serve quizzam` (or Docker via `./docker/start.sh` in `quizzam`), after copying `.env` from `.env.example`.

2. **Start this app** from **`quizzy-front-renew-app`** (this directory):

   ```sh
   pnpm install
   pnpm start
   ```

   Equivalent: `pnpm exec nx serve quizzy-front` (dev server with reload).

3. Open **http://localhost:4200/**.

The dev build uses `src/environments/environment.development.ts`, which defaults to **`http://localhost:3000/api`**. If Quizzam runs on another port (for example **3002** when using the default Docker compose mapping), update `apiUrl` / `baseUrl` there so the browser can reach the API.

## API Domain Configuration

If `localhost:3000` is no longer correct, update the backend URL in the Angular environment files:

- `src/environments/environment.development.ts` (used by `nx serve`)
- `src/environments/environment.ts` (default/prod build)

Set both `baseUrl` and `apiUrl` to your real API host, for example:

```ts
baseUrl: 'https://api.my-domain.com',
apiUrl: 'https://api.my-domain.com/api',
```

Ensure Quizzam **CORS** allows the front origin (e.g. `http://localhost:4200` in `CORS_ORIGIN` in `quizzam/.env` when not using `*`).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm start` | `nx serve` — dev server, file watching |
| `pnpm run start:once` | `nx serve-once` — one build, **no** watch (useful if Linux reports `ENOSPC` / too many file watchers) |
| `pnpm run build` | Production build to `dist/quizzy-front` |
| `pnpm test` | Unit tests (Jest) |

Run Nx targets from this folder so `nx.json` and `project.json` resolve correctly.

## Linux: `ENOSPC` (file watchers)

If `nx serve` fails with “System limit for number of file watchers reached”, raise the kernel limit (e.g. `fs.inotify.max_user_watches`) or use `pnpm run start:once` and restart the command after edits.

## Credits

Asset credits are listed in [`src/assets/credits.md`](./src/assets/credits.md).

---

Built with [Nx](https://nx.dev) and Angular.
