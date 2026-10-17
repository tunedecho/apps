---
name: sync-app
description: Update an app's website pages in this repo (tunedecho/apps) from what changed in the app's own repository since the last sync. Use when the owner says a version of an app is ready for the website, asks to update or publish an app's page, or runs /sync-app <AppName>. Also the procedure that an app repo's publish-website skill points to.
---

# Sync an app's website from its repository

Each app's folder in `apps/<AppName>/` describes one version of the app. The `source` block in its `app.json` records which commit of the app repo that is:

```json
"source": {
  "repo": "CrumpLabSandbox/DialUpSoundz",
  "syncedCommit": "e7e6006510494f0f52be3a8c047c08d38528f52a",
  "syncedAt": "2026-10-17",
  "version": "0.1.0"
}
```

Syncing means: read what changed in the app repo since `syncedCommit`, update the website so it matches the app as it is now, move the marker, and publish. The app repo is read-only here. Never commit to it from this skill.

## 1. Pick the app

The argument is the app's folder name, e.g. `DialUpSoundz`. Without one, list the folders under `apps/` whose `app.json` has a `source` block and ask which. If the app has no `source` block, ask the owner for the repository and treat this as a first sync (step 3, last bullet).

## 2. Get both repositories

- **This repo:** pull `main` first, so you build on the live site.
- **The app repo** (`source.repo`), at its default branch:
  - In a Claude Code cloud session, attach it with the `add_repo` tool (read access is enough) and clone it as that tool says.
  - Locally, look for a clone next to this one (`../<RepoName>`, any letter case), confirm its `origin` is `source.repo`, and `git fetch origin`. If there is none, clone it into the scratchpad.
  - The history must reach `syncedCommit`. In a shallow clone, run `git fetch --depth=1000 origin <default-branch>` (or `--shallow-since=<syncedAt>`) until `git cat-file -e <syncedCommit>` succeeds.
- Work from the app repo's **pushed** default branch (`origin/main`), not local uncommitted work. If the owner's local clone has unpushed commits they want on the site, ask them to push first.

## 3. Read what changed

In the app repo, with `S` = `syncedCommit` and `H` = `origin/<default-branch>`:

- `git log --format='%h %ad %s%n%b' --date=short S..H`: the commit messages, which are written to be read.
- `git diff --stat S..H`, then the diffs that matter for users: the `README.md`, the plan file, `CLAUDE.md`, app screens and services, and project configuration.
- The current app version. For iOS apps built with XcodeGen, that's `MARKETING_VERSION` in `project.yml`.
- If `S..H` is empty, tell the owner the site is already up to date and stop.
- If `syncedCommit` can't be found because history was rewritten, or this is a first sync, read the app as it is now (README, plan, screens) and rewrite the pages from that. Say you did a full read.

## 4. Privacy check: always, before writing anything

Look through `S..H` for anything that changes what data the app touches or where it goes. On iOS that means:

- new or changed `*UsageDescription` keys, `UIBackgroundModes`, entitlements, or capabilities (`project.yml`, `Info.plist`, `*.entitlements`)
- network code: `URLSession`, `http://` or `https://` URLs, WebSockets, new API clients (for example calling the Claude API)
- new packages or SDKs, especially analytics, crash reporting, ads or sign-in
- storage leaving the device: iCloud, CloudKit, shared containers, keychain items that sync, export or share features
- accounts, sign-in, payments, or anything sent to a server, including Tuned Echo's own

`grep` the diff for these, and read the plan's privacy notes. If anything turns up:

1. Draft the change to `apps/<AppName>/pages/privacy.md` and set its `updated:` front matter to today.
2. **Show the owner the draft and what in the code triggered it, and wait for their approval** before committing. The privacy policy is a legal statement. Don't publish changes to it unseen.

If nothing turns up, say so in the final summary ("no privacy-relevant changes in S..H").

## 5. Update the pages

Change only what the diff supports. Leave everything else as it is.

| What changed in the app | What to update in `apps/<AppName>/` |
|---|---|
| Anything users would notice | `pages/changelog.md`: see below |
| A new feature or a removed one | `features` in `app.json`. Keep about six; merge small ones. |
| How the main flow works | `steps` in `app.json`, and the matching section of `pages/guide.md` |
| New settings, imports, or how-tos | `pages/guide.md` |
| New requirements (OS version, subscriptions, devices) | `requires` and `platforms` in `app.json`, and the guide or support page |
| Things that commonly go wrong | `pages/support.md` FAQ |
| Tagline or summary no longer true | `tagline`, `summary` in `app.json`, and the index card follows |
| New icon | Re-export `icon.png` at 512 × 512 from the app repo's icon source |
| New screenshots in the app repo | Copy them into `screenshots/` |

**Changelog.** One `## <version> · <date or status>` section per version, newest first.
- If the version is unchanged since the last sync (still in development), add to that version's section instead of starting a new one.
- When the owner says the version shipped, put the release date in its heading, e.g. `## 0.2.0 · November 3, 2026`.
- Write bullets for what users can now do. Merge commits that describe one feature, and skip internal work: refactors, tests, CI, build tooling.

**Status and links.** Don't change `status`, `statusLabel` or `links` on your own reading of the code. Ask the owner whether the version is on TestFlight or the App Store, and get the link from them.

**Writing.** Plain and short, written for people using the app, not for its developer. Describe what the app does today. Don't present planned features as available, though a privacy page may say how a planned feature will handle data. Leave out bundle IDs, model names, build steps, internal type names, and the owner's private notes.

## 6. Check and publish

1. Update `source` in `app.json`:
   - `syncedCommit` is the full SHA of `H`.
   - `syncedAt` is today.
   - `version` is the app version from step 3.
2. `npm ci && npm run build`. Fix anything the requirements check reports.
3. For changes beyond text, preview with `npm run dev` and look at the changed pages, in light and dark mode and at phone width.
4. Commit on `main`, with a message like `Sync DialUpSoundz pages to e7e6006 (0.1.0)`. Summarize the user-facing changes in the body, then push. The deploy workflow publishes on push. Check that its run succeeded.

## 7. Report back

Tell the owner:
- the commit range synced and the app version
- which pages changed, with one line each
- the result of the privacy check
- anything you left out and why, and any questions, such as status, links or screenshots
