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

Two sides, switched with the **Professional | Art** pill in the header (desktop) or at the top of the
mobile menu. Nothing is remembered: `/` is always the professional side.

- **Professional** (`/`): VS Code hero, The Journey, Engineering Ecosystem, My Projects (each with a
  case study at `/projects/<slug>`; a project can have a product demo video), Events, Contact.
- **Art** (`/art`, always dark): a hero reel (muted loop, letterbox bars, film grain), one filmstrip row
  per category with hover previews, a full-screen theatre (swipe up/down on phones, arrow keys on desktop),
  then the five full-screen film blocks. `/films` redirects to `/art`.

Film videos live in `public/videos` (posters are the `.webp` files next to them).

## Art gallery

- Admin → **Art gallery** lists every item (imported ones arrive hidden). Tap a tile to edit the title,
  category, order (lower first, 0 = by date), featured, published, the media files (image or video, with a
  poster and an optional short preview clip). Select several tiles to publish, hide or move them at once.
- Admin → **Art page & categories**: hero reel clip, texts, and the category rows.
- Only titles are shown on the site (no dates or captions).

### Bulk import from Instagram

```
node scripts/import-instagram.mjs "<folder>" --account <name> --curation "<curation.json>" --dry-run
node scripts/import-instagram.mjs "<folder>" --account <name> --curation "<curation.json>"
```

- `<folder>`: an Instagram "Download your information" export (JSON) or a plain folder. In a plain folder,
  files named `<YYYYMMDD>_<postId>_<NN>.<ext>` become one post (a carousel if there are several); a `.jpg`
  with the same name as a video is used as its cover frame.
- Web versions are made one file at a time at low priority with ffmpeg (`-threads 2`): images WebP max
  2000 px + a 720 px thumbnail; videos H.264 MP4 max 1080p (CRF 23, AAC, faststart) + poster JPG + a 6 s muted
  preview. They are cached in `.import-cache/` (git-ignored), so the real run after a dry run re-uses them.
  Originals are never uploaded or changed.
- The dry run reports the total size against the Blob budget (`--limit-gb`, default 1 = Vercel Hobby).
  If an import would pass 95 % of it, the script stops without uploading.
- Items are inserted hidden unless the curation file says `"published": true`. The curation file maps
  post ids to `title`, `category`, `published`, `featured`, `order`, `exclude` (carousel file numbers to
  leave out), `rotate` (`ccw`/`cw` for clips posted sideways), `crop` (remove black bars) and `skip`.
- Re-running is safe: files already imported (same SHA-256) are skipped; curation changes are applied to
  them. A second account (e.g. a private one) is just another folder and `--account`.

## Content update import

`node scripts/import-content-update.mjs <content_update.json>` (add `--dry-run` to preview) writes
researched projects, skills and SS Innovations bullets into the content. It also applies the public
showcase rule: exactly six projects in a fixed order, no code links, live links only for the three
websites; everything else stays hidden. Safe to run again.

## Seeding the database

`npm run seed` fills MongoDB (or `./data/content.json`) with the starting content once.
It never overwrites existing content unless you add `--force`
(`node --env-file=.env.local scripts/seed-db.mts --force`).

## Deploying

The project is linked to Vercel. `npx vercel deploy --prod --yes` publishes the current folder.
