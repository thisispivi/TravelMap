# TravelMap user guide

How to run TravelMap, fill it with your own travels, host your photos, and put
the site online. This guide is about _using_ the tool — it assumes nothing about
how it is built.

- [1. First-time setup](#1-first-time-setup)
- [2. Running it](#2-running-it)
- [3. Where your content lives](#3-where-your-content-lives)
- [4. Adding places](#4-adding-places)
- [5. Creating a trip](#5-creating-a-trip)
- [6. Adding photos](#6-adding-photos)
- [7. Choosing where photos are served from](#7-choosing-where-photos-are-served-from)
- [8. Transport companies and logos](#8-transport-companies-and-logos)
- [9. Site settings](#9-site-settings)
- [10. Fixing validation problems](#10-fixing-validation-problems)
- [11. Backups](#11-backups)
- [12. Running the finished site with Docker](#12-running-the-finished-site-with-docker)
- [13. Publishing to GitHub Pages](#13-publishing-to-github-pages)
- [14. Command reference](#14-command-reference)

---

## 1. First-time setup

You need **Node 22.22+**, **pnpm 11.8+**, and — only if you want to process
photos — **Python 3.11+** and **ffmpeg** (ffmpeg is needed for video thumbnails
only).

```bash
pnpm install
```

That is the whole setup for the website and the editor. Photo processing has its
own one-time setup, covered in [section 6](#6-adding-photos).

---

## 2. Running it

There are two applications. Start both:

```bash
pnpm dev
```

| Address                 | What it is                                  |
| ----------------------- | ------------------------------------------- |
| <http://localhost:5173> | **The site** — what visitors see            |
| <http://localhost:5174> | **The editor** — where you add your content |

To start only the editor:

```bash
pnpm editor
```

The editor writes directly to your content files as you type, and autosaves
about a second after you stop. There is no "save" button and no publish step —
the site picks the changes up on reload.

> **Do not hand-edit files under `data/` while the editor is open.** The editor
> holds the file in memory and will write its own copy back over yours. Close
> the editor first, or make the change through the editor.

---

## 3. Where your content lives

Everything you author lives in one folder:

```text
data/
├── site.config.json          Global settings
├── cities/
│   └── Italy/
│       ├── Italy.json        The country
│       └── Rome/Rome.json    A city in it
├── trips/
│   └── rome-trip-2026.json   One trip
├── photos/
│   └── Italy/Rome/tr_150826_180826.json   Photo list for one stay
└── logos/
    └── Ryanair.svg           Transport company logos
```

`data/` and `media/` are **not** stored in git. They are yours, they stay on
your machine, and a fresh clone of the repository starts empty. Your photos and
logos are only ever on your disk (and on your CDN, if you use one), so keep your
own backup of them — see [section 11](#11-backups).

---

## 4. Adding places

You never create a country by hand. Add a city, and if its country is new, the
editor creates it for you with its name, continent, currency, translated names
and map colour already filled in.

To add a city, open a trip and click **Add place**. You can either:

- **search a worldwide city database** by name, or
- **paste a Google Maps link** and let the editor read the coordinates out of it
  (short `goo.gl` links work too).

Coordinates and time zone come from the database automatically. Population is
optional and only affects how prominently the map labels the city.

To find something you already have, use the **Places** card on the editor home
page. The **Search countries** and **Search cities** boxes are fuzzy and ignore
filler words, so `the city of rome`, `roma` and even the typo `rme` all find
Rome. Searching cities also matches on country, so `japan` lists every Japanese
city.

---

## 5. Creating a trip

1. On the editor home page, click **New trip**.
2. Give it a title and a start and end date.
3. Add your stops and how you travelled between them, in order.

A trip is a sequence of **stops** (somewhere you were) and **transports** (how
you got between them).

### Layovers matter

Mark a stop as a **layover** when you only passed through — a connecting airport,
a station change, a night near the airport before an early flight.

Layover stops are deliberately excluded from everything that counts as having
_been_ somewhere: they never appear in Visited places, and they never count
toward your city, country or statistics totals. The same is true of the city a
trip starts and ends from. Only real stays count.

Mark them anyway — they make the route on the map correct, and they remove a
whole category of validation warning (see
[section 10](#10-fixing-validation-problems)).

### Future trips

A trip whose start date is in the future is treated as planned, not done:

- it does **not** appear in the site's trip list, timeline, or statistics
- its cities **do** appear under **Places → Future**

Nothing marks a trip as future — it happens automatically from the start date,
and reverses itself once the date passes.

---

## 6. Adding photos

Photos are handled in two steps: **process them**, then **attach them to a
stay**.

### One-time uploader setup

```bash
cd scripts/uploader
python -m venv venv
venv/Scripts/activate      # macOS or Linux: source venv/bin/activate
pip install -r requirements.txt
cp env/example.env env/.env
```

Open `env/.env` and adjust the image size limits if you like. You only need to
fill in the `CDN_*` values if you plan to upload to BunnyCDN; leave them alone
for local hosting.

### Step 1 — process the photos

Put the original photos in a folder named after the city, numbered in the order
you want them shown:

```text
scripts/uploader/photos/Rome/
├── 001.jpg
├── 002.jpg
└── 003.mp4
```

Then, from `scripts/uploader/`:

```bash
python main.py -c Rome -C Italy --local
```

- `-c` is the folder name under `photos/`
- `-C` is the country, spelled the same way as your country in `data/cities/`
- `--local` keeps everything on your machine. **Leave it off** to upload to
  BunnyCDN instead.

Each photo becomes two WEBP files — a full-size one and a thumbnail. Videos get
a thumbnail taken from their first frame. The result:

| Where                        | What                                       |
| ---------------------------- | ------------------------------------------ |
| `media/Travels/Italy/Rome/`  | The optimized image files (with `--local`) |
| `scripts/uploader/Rome.json` | A list describing them, for step 2         |

### Step 2 — attach them to a stay

1. In the editor, open the trip and click the stop the photos belong to.
2. Next to **Photo manifest**, click **Import…**.
3. Paste the contents of `scripts/uploader/Rome.json`, or pick the file.
4. Click **Review**.

The editor works out the filename and location from the stop's city and dates,
so you never name the file yourself. The review step shows you:

- how many photos it found, and exactly where it will save them
- a warning if a file already exists there, with the choice to **Replace** or
  cancel
- a box for any **YouTube video ID**, for entries that are videos rather than
  photos

Confirm, and the stop is linked to its photos. The gallery works immediately.

---

## 7. Choosing where photos are served from

Photos can come from your own machine or from BunnyCDN. One setting decides,
in `apps/travel-map/env/.env`:

```bash
# Serve from your own media/ folder
VITE_CDN_PATH="/media"

# Or serve from BunnyCDN
VITE_CDN_PATH="https://your-zone.b-cdn.net/TravelMap"
```

Restart `pnpm dev` after changing it.

Both work the same way from the site's point of view, so you can switch back and
forth freely. If you want a path prefix other than `/Travels` inside `media/`,
change **Media root** in the editor's Settings screen _before_ processing
photos — it is written into the photo lists as they are created.

---

## 8. Transport companies and logos

Airlines and ferry operators are defined once and then reused by every trip.

1. In the editor, open **Companies**.
2. Add the operator with an **id**, a display **name**, and a **logo**.
3. In a trip, pick the operator from the dropdown on a flight or ferry leg.

The **id** is what your trips store, and it must match exactly — use lowercase
with underscores, like `ryanair` or `ita_airways`. If a company shows up on the
statistics page as a raw id with no logo, the id on the leg does not match the
id in Companies.

Logos are stored in `data/logos/` and uploading one through the editor puts it
there for you. They are bundled into the site automatically, so no extra step is
needed to publish them.

---

## 9. Site settings

The editor's **Settings** screen covers everything global:

| Setting                                | What it does                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Site name, domain, description, author | Page title, search metadata, and the custom domain used when publishing                                                 |
| Locales                                | Extra languages you can write translated names in                                                                       |
| Home city                              | Your own city, shown with its own marker                                                                                |
| Lived cities                           | Places you have lived. Like layovers, these are kept out of visited places and statistics — they are their own category |
| Future cities                          | Places to show as planned even without a trip for them yet                                                              |
| Media root                             | The path prefix written into new photo lists (default `/Travels`)                                                       |
| Map defaults                           | Starting zoom, centre, and marker sizes                                                                                 |
| UNESCO sites                           | Site names per country, shown in statistics                                                                             |

---

## 10. Fixing validation problems

The editor checks your content continuously. Every trip shows a badge, and the
**Validation** tab at the bottom of a trip lists the details with a one-click fix
where one exists.

There are three levels:

| Level          | Meaning                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| **Blocking**   | Genuinely wrong — for example a stop that ends before it starts. Fix these. |
| **Warning**    | Worth fixing, but the site still works.                                     |
| **Suggestion** | Cosmetic or informational.                                                  |

The most common warning by far is **"This leg does not connect X to Y"**. It
means a transport leg starts or ends somewhere that is not the stop next to it —
almost always because the journey passes through a hub with no stop recorded
there. Add a **layover** stop for the hub and the warning disappears, the route
draws correctly, and nothing is added to your visited totals.

---

## 11. Backups

Because `data/` is not in git, the editor keeps its own safety net. Every risky
action writes a full snapshot to `.data-snapshots/`, and it keeps the last 30.

Open **Settings → Backups** to take one by hand, restore an earlier one, or
download one as a single file. Snapshots cover everything you have authored —
trips, cities, countries, settings, photo lists — but **not** the image files
themselves. Keep your own copy of `media/` and your original photos.

---

## 12. Running the finished site with Docker

To run the real, built site on your own machine or server:

```bash
docker compose -f docker/compose.yml up --build
```

The site is then at <http://localhost:8080>, with your photos served from
`media/`.

`media/` is mounted live, so **adding or replacing photos needs no rebuild** —
drop the files in and reload. Changing trips, cities or settings does need a
rebuild, because that content is compiled into the site:

```bash
docker compose -f docker/compose.yml up --build
```

---

## 13. Publishing to GitHub Pages

```bash
pnpm --filter travel-map deploygh
```

This builds the site and pushes it to the `gh-pages` branch. The custom domain
comes from the **domain** field in Settings.

Before publishing, decide where photos should come from. GitHub Pages serves
only the site, so `VITE_CDN_PATH` must point at BunnyCDN (or another host) — a
`/media` path has nothing behind it there.

---

## 14. Command reference

Run these from the repository root unless noted.

| Command                                           | What it does                                               |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm install`                                    | Install everything (first time, and after pulling changes) |
| `pnpm dev`                                        | Start the site and the editor together                     |
| `pnpm editor`                                     | Start only the editor                                      |
| `pnpm build`                                      | Build the production site into `apps/travel-map/dist`      |
| `pnpm check`                                      | Verify the code is healthy — run before committing         |
| `pnpm --filter travel-map preview`                | Preview the built site locally                             |
| `pnpm --filter travel-map deploygh`               | Publish to GitHub Pages                                    |
| `docker compose -f docker/compose.yml up --build` | Run the built site plus your photos                        |
| `python main.py -c <City> -C <Country> --local`   | Process photos locally (from `scripts/uploader/`)          |
| `python main.py -c <City> -C <Country>`           | Process photos and upload to BunnyCDN                      |
| `python main.py --help`                           | Uploader options                                           |
