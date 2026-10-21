# Stoughton Gymnastics website

Static site built with **Astro + Tailwind CSS v4**. Every page is plain HTML when built, so it is fast and cheap to host.

## Quick start (for a developer)

```bash
nvm use            # Node 22 (see .nvmrc); Astro 7 needs Node >= 22.12
npm install
npm run fetch:assets   # downloads the 38 photos into src/assets/images/ (skip if already there)
npm run dev        # local dev server at http://localhost:4321
npm run build      # builds the site into dist/
npm run preview    # serves dist/ locally
```

Extra checks:

- `npm run check:verbatim` makes sure the original site's sentences still appear word for word.
- `npm run check:placeholders` lists every yellow "PLACEHOLDER - confirm with gym" box that is still in the build.
- `npm run build:launch` builds and then **fails if any placeholder remains**. Use this for the real launch.

## How to update content (plain English)

All of the words, prices and photos live in a few small files. Change the file, save, and the site rebuilds.

| What you want to change | Edit this file |
|---|---|
| Phone, email, address, hours, Facebook/Instagram, iClassPro links | `src/content/site.json` (the only place these live) |
| Class prices, ages and descriptions (Home, Classes Offered, pricing table) | `src/content/programs.json` |
| Birthday party packages | `src/content/parties.json` |
| Calendar (class dates and CLOSED dates) | `src/content/calendar.json`: one line per item. Months in the past move into "Past dates" automatically. |
| Tuition & policies | `src/content/policies.md`: each `## Heading` is one policy. A line starting with `!PH ` shows a yellow "confirm with gym" note. |
| Coach bios | `src/content/coaches.json` |
| Photos page gallery | Put the photo in `src/assets/images/photos/`, then add `{ "file": "photos/your-photo.jpg", "alt": "what the photo shows" }` to `src/content/gallery-photos.json` |
| Team page gallery | Same idea with `src/assets/images/team-gymnastics/` and `src/content/gallery-team.json` |

Hours: when the gym confirms its hours, update `hoursText` in `site.json` and set `"hoursConfirmed": true`.

## Hidden coach page

`/coach-info` is built but hidden: it is not linked anywhere, has `noindex`, and is left out of the sitemap.
To publish it after the gym approves, build with `SHOW_COACHES=true` (or change the default in `src/flags.mjs`) and add a link to it in `src/lib/site.ts`.

## Contact form

The form uses **Netlify Forms** (`data-netlify="true"` with a honeypot field). It only works once the site is deployed on Netlify. In the Netlify dashboard, set form notifications to the gym's inbox.

## How to deploy

1. Push this folder to a Git repository (GitHub, for example).
2. In Netlify: "Add new site", then "Import from Git", pick the repo. The settings come from `netlify.toml` (build `npm run build`, publish `dist`, Node 22).
3. After that, every push to `main` rebuilds and publishes the site automatically.
4. When the gym is ready to leave Wix, point `stoughtongymnastics.com` / `www` DNS at Netlify. `public/_redirects` sends `/blank`, `/home` and `/about-us` to the home page.

Cloudflare Pages works too (build command `npm run build`, output `dist`), but the contact form would then need Formspree or similar.
