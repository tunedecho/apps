# Tuned Echo Apps

Web pages for Tuned Echo apps, served at [tunedecho.com/apps](https://tunedecho.com/apps/). Each app gets a landing page, plus a guide, changelog, privacy policy and support page, in the same style as [tunedecho.com](https://tunedecho.com).

| Address | Page |
|---|---|
| `/apps/` | Index of every app |
| `/apps/DialUpSoundz/` | An app's landing page |
| `/apps/DialUpSoundz/guide/`, `/changelog/`, `/privacy/`, `/support/` | An app's other pages |
| `/apps/dialupsoundz/` | Redirects to the real address. The 404 page fixes any other letter case. |

## Add an app

1. Make a folder in `apps/`. Its name is the address, so `apps/MyApp/` becomes `tunedecho.com/apps/MyApp/`. Use letters, numbers and hyphens.
2. Add `icon.png`, square, at least 512 × 512.
3. Add `app.json`. Copy `apps/DialUpSoundz/app.json` and edit it.
4. Add pages as Markdown in `pages/`. All are optional.
5. Run `npm run build` to check it, then push to `main`.

```
apps/MyApp/
  app.json
  icon.png
  screenshots/      optional: PNG, JPEG or WebP, shown in file name order
  index.html        optional: replaces the generated landing page entirely
  pages/
    index.md        extra sections at the bottom of the landing page
    guide.md
    changelog.md
    privacy.md
    support.md      falls back to site/defaults/support.md
    anything.md     any other page, at /apps/MyApp/anything/
```

### app.json

| Field | |
|---|---|
| `name`, `tagline` | Required. Shown on the index card and the landing page. |
| `summary` | A paragraph under the tagline. |
| `status` | Required. `available` (App Store button, needs `links.appStore`), `beta` (TestFlight button, needs `links.testFlight`), `coming-soon`, or `showcase` (no button). |
| `statusLabel` | Replaces the status wording on the landing page, e.g. "Coming soon to the App Store". |
| `accent`, `accentDark` | The app's color, for light and dark mode. Used for the status dot, step markers, links and the card's top edge. |
| `platforms`, `requires` | Shown above the app name, e.g. `["iPhone"]` and `"iOS 17 or later"`. |
| `stores` | Stores the app is going to, e.g. `["apple"]`. The build checks each store's requirements. |
| `links` | `appStore`, `testFlight`. |
| `supportEmail` | Used by the support and privacy pages as `{{supportEmail}}`. |
| `privacy` | `"no-data"` uses the shared policy in `site/defaults/privacy-no-data.md`, for apps that collect nothing. Anything else means you write `pages/privacy.md`. |
| `steps`, `stepsHeading` | "How it works", a list of `{ "title", "body" }`. |
| `features`, `featuresHeading` | "What it does", a list of `{ "title", "body" }`. |
| `order` | Optional number to pin an app's place on the index. Otherwise available apps come first, then beta, coming soon and projects, each by name. |

### Markdown pages

Start a page with front matter:

```markdown
---
title: Privacy policy
description: One line for search results and link previews.
updated: October 17, 2026
order: 30
---
```

All fields are optional. `{{name}}`, `{{supportEmail}}` and any other `app.json` text field can be used in the text. Headings get ids, so you can link to `guide/#some-heading`.

## Store requirements

`site/requirements.json` lists what each store needs. An app that lists the store in `stores` must have those pages and `app.json` fields, or the build fails and says what's missing.

```json
{
  "apple": { "label": "Apple App Store", "pages": ["privacy", "support"], "fields": ["supportEmail"] }
}
```

Add a new store or tighten a rule there, and every app is checked against it.

## Preview and publish

```sh
npm install
npm run dev        # builds, then serves at http://localhost:8080/apps/
```

Every push to `main` builds the site and deploys it to GitHub Pages with `.github/workflows/deploy.yml`. Pull requests build but don't deploy. In the repository's Pages settings, the source must be "GitHub Actions".

On macOS, local builds skip the lowercase redirect folders, because the file system treats `dialupsoundz` and `DialUpSoundz` as the same folder. The live site has them.

## Layout

| Path | What's there |
|---|---|
| `apps/` | One folder per app. |
| `site/styles.css` | Shared styles, with the design tokens from tunedecho.com at the top. |
| `site/templates.mjs` | The HTML for the index, landing, page, redirect and 404 pages. |
| `site/site.json` | Site address, base path, and the index page's text. |
| `site/requirements.json` | What each store requires. |
| `site/defaults/` | Shared Markdown pages used when an app doesn't have its own. |
| `site/assets/` | The Tuned Echo seal, used as the index favicon. |
| `scripts/build.mjs` | Builds `_site/`. |
| `scripts/serve.mjs` | Local preview server. |
