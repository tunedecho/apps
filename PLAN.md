# Tuned Echo Apps: plan

A web page for each Tuned Echo app, served at `tunedecho.com/apps/<AppName>/`, with an index of all apps at `tunedecho.com/apps/`.

## How it is hosted

`tunedecho/tunedecho.github.io` is the organization's GitHub Pages site, with the custom domain `tunedecho.com`. GitHub serves every other Pages-enabled repository in the organization under that domain at `/<repo-name>/`. So once Pages is on for this repository, it appears at `tunedecho.com/apps/`, with no DNS change and no change to the main site.

One-time setup: in this repository's settings, under Pages, set the source to "GitHub Actions".

## Decisions

| Question | Decision |
|---|---|
| How pages are built | Each app is a folder of data and Markdown. A small Node script renders everything from shared templates into static HTML. |
| Look | The main site's letterhead style: the same color tokens, fonts (Instrument Serif, Plus Jakarta Sans, Oswald), the six bars, light and dark modes. Each app adds one accent color. |
| URL casing | `/apps/DialUpSoundz/` is the canonical page. `/apps/dialupsoundz/` redirects to it, and a 404 page redirects any other casing. |
| Pages per app | Landing page, guide, changelog, privacy policy, support. |
| Store requirements | Written down per store (Apple first) and checked by the build, so a missing privacy policy fails the build instead of the App Store review. More stores or other requirements can be added later. |
| DialUpSoundz status | Coming soon. |

## Layout

```
apps/
  DialUpSoundz/              folder name = URL slug
    app.json                 name, tagline, accent, status, stores, links, features
    icon.png
    screenshots/             optional
    pages/
      index.md               longer description and custom sections for the landing page
      guide.md
      changelog.md
      privacy.md             optional: falls back to the shared template
      support.md             optional: falls back to the shared template
    index.html               optional: if present, used instead of the generated landing page
site/
  styles.css                 shared tokens and components, taken from the main site
  templates.mjs              index, app, page, redirect and 404 templates
  site.json                  site address, base path, index text
  requirements.json          what each store needs (pages and app.json fields)
  defaults/                  shared support page, and a privacy policy for apps that collect nothing
scripts/build.mjs            reads apps/*, checks requirements, writes _site/
scripts/serve.mjs            local preview at http://localhost:8080/apps/
.github/workflows/deploy.yml build, then deploy to Pages on every push to main
```

### app.json

```json
{
  "name": "DialUpSoundz",
  "tagline": "Talk a playlist through with Claude, then save it to Apple Music.",
  "accent": "#4f8fcf",
  "status": "coming-soon",
  "platforms": ["iPhone"],
  "stores": ["apple"],
  "links": { "appStore": null, "testFlight": null },
  "supportEmail": "appsupport@tunedecho.com",
  "features": [
    { "title": "Make a playlist from Claude's list", "body": "..." }
  ]
}
```

`status` is one of `available`, `beta`, `coming-soon` or `showcase`, and sets the button: App Store badge, Join the beta, Coming soon, or none.

### requirements.json

```json
{
  "apple": {
    "pages": ["privacy", "support"],
    "fields": ["supportEmail"]
  }
}
```

The build fails, naming the app and what is missing, when an app lists a store and lacks something that store requires. A page counts as present when the app has its own Markdown file or the shared template can fill it from `app.json`.

## Pages

- **`/apps/`**: wordmark header linking back to `tunedecho.com`, then a card per app with icon, name, tagline and status, sorted with available apps first.
- **`/apps/<App>/`**: hero with icon, name, tagline and the status button. Then features, screenshots if any, the content of `pages/index.md`, and links to the other pages.
- **`/apps/<App>/guide/`**, **`/changelog/`**, **`/privacy/`**, **`/support/`**: Markdown pages in the same frame, with a small app header and a sub-navigation.
- **`/apps/<lowercase>/`**: redirect to the canonical URL, generated only when the lowercase name differs.
- **`/apps/404.html`**: if the path matches an app name in any letter case, redirects there; otherwise a plain "not found" with a link to the index.

## Build

- Node 20, with one dependency: `marked` for Markdown.
- `npm run build` writes `_site/`. `npm run dev` builds and serves it locally.
- Lowercase redirect folders are not generated on case-insensitive file systems (macOS by default), where they would overwrite the real page. Local previews there skip them; the CI build on Linux includes them.

## DialUpSoundz first version

Written from the DialUpSoundz README and PLAN:

- Landing: what it does (talk it through with Claude, paste, review matches, save), the dashboard, a Coming soon button. Icon from `design/icon/png/AppIcon-1024.png`.
- Guide: using it with Claude, and bringing in past listening from Apple's data export.
- Changelog: a first entry for the current version.
- Privacy: listening history stays on the phone, the Claude key stays in the keychain, nothing is sent to Tuned Echo. Apple Music access is used only to match and save playlists.
- Support: FAQ (Apple Music subscription and Sync Library, why plays before install need the Apple export) and the contact email.

## Steps

- [x] Shared styles and templates from the main site's design tokens.
- [x] Build script with the requirements check, redirects and 404.
- [x] Deploy workflow.
- [x] DialUpSoundz folder and pages. Support contact: appsupport@tunedecho.com.
- [x] README: how to add an app.
- [x] Pages is on for this repository. Its source must be "GitHub Actions".
- [ ] DialUpSoundz screenshots, once there are some from a device.
- [ ] Switch DialUpSoundz to `beta` or `available` with its link when it ships.
- [ ] Later, not now: an "Apps" link in the main site's navigation in `tunedecho/tunedecho.github.io`.
