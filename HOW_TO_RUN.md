# How to run the portfolio

A personal portfolio site with a built-in admin panel. Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Start it on this PC

1. Open a terminal in this folder (`portfolio`).
2. First time only: `npm install`
3. Start the site in development mode: `npm run dev`
4. Open http://localhost:3000. The admin is at http://localhost:3000/admin.

For the fast production version instead of dev mode: `npm run build` and then `npm start`.
To stop the site, press `Ctrl + C` in the terminal.

> The folder path contains `&`. That's why the npm scripts call Next.js directly
> (`node node_modules/next/dist/bin/next ...`). Use the npm scripts and it works.

## Admin login

- Go to `/admin` and sign in with the username and password from your environment variables
  (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). Locally they're in `.env.local`, which is never committed.
- After 5 wrong attempts from the same network, login is locked for 15 minutes.
- In the admin you can edit everything: the hero code editor (developer.ts lines, README.md and
  styles.css tabs), The Journey (work + education cards), Skills and their filter tabs, Projects (each
  has a case-study page), Films (title, text, colour, order, show/hide, video + poster upload: videos
  go straight from the browser to Vercel Blob, up to 200 MB), Events photos, Contact, Social links,
  the order and visibility of sections, the resume PDF, SEO and the default theme (system / dark / light).
  The eye icon hides an item without deleting it. Messages from the contact form appear under
  **Messages**. The Dashboard shows page views (no cookies, no third-party trackers).
- Changes show on the live site on the next visit after saving.

## Where data lives

| Setting | Content, messages, page views | Uploaded images / PDFs |
|---|---|---|
| `MONGODB_URI` set | MongoDB | Vercel Blob if `BLOB_READ_WRITE_TOKEN` is set |
| Local, no `MONGODB_URI` | JSON files in `./data` | `./public/uploads` (served at `/media/...`) |
| On Vercel without `MONGODB_URI` | Built-in content, read-only (admin shows a warning) | Vercel Blob if the token is set |

`./data`, `./public/uploads` and every `.env*` file except `.env.example` are git-ignored.

## Environment variables

See `.env.example`. In Vercel: Project → Settings → Environment Variables.

| Name | Needed | What it is |
|---|---|---|
| `ADMIN_USERNAME` | yes | Admin username |
| `ADMIN_PASSWORD` | yes | Admin password |
| `SESSION_SECRET` | yes | Random text, 32+ characters, used to sign the login cookie |
| `MONGODB_URI` | for editing on Vercel | MongoDB connection string (set by the Vercel MongoDB Atlas integration) |
| `MONGODB_DB` | no | Database name, default `portfolio` |
| `BLOB_READ_WRITE_TOKEN` | for uploads on Vercel | Set automatically when a Vercel Blob store is connected |
| `NEXT_PUBLIC_SITE_URL` | no | Public URL for sitemap and link previews (or set it in Admin → SEO) |

To get the latest variables from Vercel onto this PC: `npx vercel env pull .env.local --yes`.

## Design

The public site is the original portfolio (VS Code hero, The Journey, Engineering Ecosystem,
My Projects, Filmmaking & Cinematography) rebuilt from its source, plus a floating glass header,
light/dark themes, Lenis smooth scrolling, Events and Contact. Film videos live in `public/videos`
(posters are the `.webp` files next to them).

## Seeding the database

`npm run seed` fills MongoDB (or `./data/content.json`) with the starting content once.
It never overwrites existing content unless you add `--force`
(`node --env-file=.env.local scripts/seed-db.mts --force`).

## Deploying

The project is linked to Vercel. `npx vercel deploy --prod --yes` publishes the current folder.
