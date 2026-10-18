---
title: Guide
description: How to make playlists in your chat app, ask the Operator, and bring in your past listening.
---

## Make a playlist in your chat app

1. In DialUpSoundz, open **Make › Copy prompt**.
2. Paste it at the start of a chat in your chat app. It works with chat assistants like Claude, ChatGPT and Gemini; pick yours in **Settings › Your chat app**, and the Open buttons go to it. With the Data Layer, the Operator, an assistant that knows your ratings, does this better: see [Ask the Operator](#ask-the-operator).
3. Talk it through: moods, eras, deep cuts, what to leave out.
4. When you're happy, ask for the list. The assistant replies with a block of JSON. Copy it.
5. Switch to DialUpSoundz, tap **Paste**, then **Find on Apple Music**.

### What the list can look like

The prompt asks for this shape:

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

An **artist** brings in some of their best-known songs, and an **album** brings in tracks from it. For a list of whole albums, ask for an album list instead, or switch the list to albums on the Make tab.

## Review before saving

- Matches that need a look are marked in orange.
- Tap any song to swap it for another version or play a 30-second preview.
- Tap **Edit** to reorder, swipe to remove, and search by hand for anything that wasn't found.
- Nothing is saved until you tap **Save**.

Each saved playlist keeps the list it came from, under **Made**, so you can match it again later.

## Free, and the Data Layer

Making playlists and album lists is free. A one-time **Data Layer** unlock adds everything below: rating, the Operator, research, and your data. Your listening is recorded from the day you install the app either way, so it's all there when you unlock.

## Rate what you hear

**Rated › Rate a batch** shows one album or song at a time. Switch between **Albums** and **Songs** at the top. The source menu picks what to rate:

- **Most played:** the music you've played most and haven't rated, filterable by decade or genre.
- **Your library:** saved albums you haven't rated.
- **An artist:** their albums in release order, or their top songs.
- **Listened, from Listen Later:** what you've marked heard and haven't rated.
- **Search Apple Music:** anything else.

On each card, tap the stars, love it or mark it **not for me**, tap your tags, add liner notes, then tap **Next**. To go faster, turn off **Options › Show tags and liner notes**, and a star saves and moves on. **Haven't heard** takes it out of the queue. **Preview** plays a 30-second clip to remind you how it sounds, and **Play** plays it in full; **Options** can preview each card as it arrives.

**Your tags** are offered every time you rate. Edit them in **Options › Edit your tags**, or **Rated › More › Manage tags**: add, reorder, rename or merge.

You can also rate from any album or song page, and in **Listen Later**: tap the circle when you've heard something, and the app asks how it was.

## Playlists

The **Playlists** tab holds every playlist you save from a list. With the Data Layer it becomes your own layer of playlists:

- **Playlist tags:** every song and album page has a **Playlists** row. Tap a playlist to put it in, tap again to take it out.
- **Add from the playlist:** **Add songs or albums** searches Apple Music or your library. Tap + to add.
- **Songs and albums:** a playlist can hold whole albums, which play as the album. Switch any playlist to **Albums** to see it grouped by album.
- **Import from Apple Music:** **Playlists › + › Import from Apple Music** copies the playlists you pick into the app. The originals aren't changed.
- **Save to Apple Music** puts a playlist in your library, and **Update in Apple Music** refreshes that copy later. Albums go in as their songs, because Apple Music playlists hold songs only.
- **Ask the Operator for one like this** copies a prompt with the playlist and your ratings of it, for a new playlist in the same spirit.

## Listen Later

Save albums and songs to hear later, one at a time, or with **Save all to Listen Later** from a playlist draft or album list. Each list you save from becomes a list in **Later › Lists**, where you can play it in order, make it into a playlist, or rename it. Long-press an item to move it between lists, and tap its circle once you've heard it.

## Ask the Operator

The Operator is your chat assistant, set up once with your ratings and listening, so every chat recommends music that fits your taste.

1. Open **Rated › Operator setup**.
2. In your chat app, make a project or saved assistant called DialUpSoundz. Most chat apps have one: Claude and ChatGPT call them Projects, and Gemini calls them Gems. Paste in the instructions the app copies for you.
3. Tap **Export your music profile**, save the file, and add it to the project's files. It holds your ratings, tags, notes, Listen Later, and counts of what you play most, never individual plays.
4. Ask for something, like "five albums I haven't heard that I'd rate 5 stars". When you're happy, ask for the list and paste it on the **Make** tab.

Export the music profile again now and then as your ratings grow, and replace the old file.

## Research an album or song

Every album and song page has **Research**:

1. Tap **Copy a research prompt**, then open your chat app, and paste it.
2. Dig in with the Operator for as long as you like.
3. Ask it to save the research, copy its reply, and tap **Paste the research**.

The summary, facts, what to listen for and what to hear next are kept with that album or song. The Operator's lists also say what each song or album is, and that's kept when you save them. Find everything under **Data › Operator's notes**.

## Your data

The **Data** tab is everything the app has built up:

- **Browse:** your listening history by artist, album or song. Tap one to play or rate it.
- **Explore:** loved and 5-star lists, tags, Operator's notes, charts, and the JSON underneath. Any of these plays like a playlist. Tap tags to combine them, matching all of them or any, then play the result, make it a playlist, or save it to Listen Later.
- **Export everything:** your plays, ratings, Listen Later, playlists with their songs and albums, and notes as one JSON file, to keep or use elsewhere.
- **Import an export:** bring an export back, to move to a new iPhone or restore a backup. Anything already there isn't duplicated.

## Bring in your past listening

Apple doesn't give apps your full play history, so DialUpSoundz records it from the day you install it. You can fill in the years before that with Apple's own export:

1. Go to [privacy.apple.com](https://privacy.apple.com), choose **Request a copy of your data**, and tick **Apple Media Services information**.
2. Apple emails you when it's ready, usually within a few days.
3. Unzip it in the Files app. In the Apple Music Activity folder, find **Apple Music - Play History Daily Tracks.csv** or **Apple Music Play Activity.csv**.
4. In DialUpSoundz, open the **Data** tab, tap **Import Apple's play history**, and choose it.

Importing replaces the app's estimated plays for the same dates with Apple's exact ones. Importing the same file twice doesn't count anything twice.
