# tunedecho/apps: notes for Claude

Web pages for Tuned Echo apps, served at https://tunedecho.com/apps/. `README.md` explains how the site works and how to add an app. `PLAN.md` holds the decisions behind it.

## Rules for every page

- **Google Analytics tag on every page.** The tag ID lives in `site/site.json` (`googleTagId`, currently `G-XQEPE1KZTT`).
  - Pages built from `site/templates.mjs` get it through `layout()`.
  - A hand-written `apps/<AppName>/index.html` gets it added by the build if it's missing.
  - `npm run build` fails if any HTML page in `_site/` lacks it. The only exception is redirect stubs, which forward instantly and would double count visits.
  - If you add a new kind of page, build it with `layout()`, or make sure the check still passes. Don't weaken or skip the check.
  - Paste the snippet by hand only for HTML that never goes through the build.
- **Design:** tokens and components in `site/styles.css` follow tunedecho.com. Reuse them rather than adding new colors or fonts.
- **Store requirements:** `site/requirements.json` lists what each store needs. The build checks it.
- **Privacy pages are legal statements.** Show the owner any change to a privacy policy and wait for approval before publishing.

## Workflow

- Work on `main` and push. `.github/workflows/deploy.yml` builds and deploys to GitHub Pages.
- Run `npm run build` before every push.
- To update an app's pages from its repository, use the `sync-app` skill.
