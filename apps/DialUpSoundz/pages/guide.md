---
title: Guide
description: How to make playlists with Claude and bring in your past listening.
---

## Make a playlist with Claude

1. In DialUpSoundz, open **Make › Copy prompt**.
2. Paste it at the start of a chat on [claude.ai](https://claude.ai) or in the Claude app. If you'll make playlists often, create a Claude Project called DialUpSoundz and put the prompt in its instructions.
3. Talk it through: moods, eras, deep cuts, what to leave out.
4. When you're happy, ask for the list. Claude replies with a block of JSON. Copy it.
5. Switch to DialUpSoundz, tap **Paste**, then **Find on Apple Music**.

### What the list can look like

The prompt asks Claude for this shape:

```json
{
  "name": "Late Night Soul",
  "description": "Slow burners for after midnight.",
  "items": [
    {"kind": "song", "title": "Inner City Blues (Make Me Wanna Holler)", "artist": "Marvin Gaye"},
    {"kind": "artist", "artist": "Bill Withers", "count": 2},
    {"kind": "album", "title": "Innervisions", "artist": "Stevie Wonder", "count": 1}
  ]
}
```

You don't have to use it. DialUpSoundz also reads plain lists, one per line:

```
Marvin Gaye - Inner City Blues
"Lovely Day" by Bill Withers
Curtis Mayfield
```

An **artist** brings in some of their best-known songs, and an **album** brings in tracks from it. For a list of whole albums, ask Claude for an album list instead, or switch the list to albums on the Make tab.

## Review before saving

- Matches that need a look are marked in orange.
- Tap any song to swap it for another version or play a 30-second preview.
- Tap **Edit** to reorder, swipe to remove, and search by hand for anything that wasn't found.
- Nothing is saved until you tap **Save**.

Each saved playlist keeps the list it came from, under **Made**, so you can match it again later.

## Rate what you hear

Open any album or song, from an album list, Listen Later or a draft, to rate it:

- **Stars** from 1 to 5. Tap a star again to clear it.
- **Love it** or mark it **not for me**.
- **Tags**, a word or two that helps you find it again, like "late night" or "start here".
- A **note**, for anything else.

In **Listen Later**, tap the circle next to an item when you've heard it, and the app asks how it was. The heart in the now-playing bar loves whatever's playing.

The **Rated** tab lists everything you've rated. Filter it by albums or songs, by loved, or by tag.

### Give Claude your taste

Your ratings can steer Claude's suggestions. On the **Make** tab, tap **Copy prompt with my ratings** to copy the prompt and a summary of what you've rated, then paste both into a new chat. **Rated › Taste for Claude** shows the summary on its own.

The summary lists the titles and artists you've rated, with your stars, tags and notes. It's only shared when you paste it somewhere.

## Bring in your past listening

Apple doesn't give apps your full play history, so DialUpSoundz records it from the day you install it. You can fill in the years before that with Apple's own export:

1. Go to [privacy.apple.com](https://privacy.apple.com), choose **Request a copy of your data**, and tick **Apple Media Services information**.
2. Apple emails you when it's ready, usually within a few days.
3. Unzip it in the Files app. In the Apple Music Activity folder, find **Apple Music - Play History Daily Tracks.csv** or **Apple Music Play Activity.csv**.
4. In DialUpSoundz, open the **Listening** tab, tap the gear for **Settings**, then **Import play activity file** and choose it.

Importing replaces the app's estimated plays for the same dates with Apple's exact ones. Importing the same file twice doesn't count anything twice.
