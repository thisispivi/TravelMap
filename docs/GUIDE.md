# TravelMap user guide

How to run TravelMap, fill it with your own travels, host your photos, and put
the site online. This guide covers using the tool and assumes nothing about how
it is built.

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

## 1. First-time setup

You need Node 22.22+ and pnpm 11.18+. To process photos you also need
Python 3.11+ and ffmpeg (ffmpeg is used only for video thumbnails).

```bash
pnpm install
cp apps/travel-map/env/.env.example apps/travel-map/env/.env
```

That is all the setup the website and the editor need. Photo processing has its
own one-time setup, covered in [section 6](#6-adding-photos).

## 2. Running it

There are two applications. Start both:

```bash
pnpm dev
```

| Address                 | What it is                             |
| ----------------------- | -------------------------------------- |
| <http://localhost:5173> | The site, which is what visitors see   |
| <http://localhost:5174> | The editor, where you add your content |

To start only the editor:

```bash
pnpm editor
```

The editor writes directly to your content files and autosaves about a second
after you stop typing. There is no save button and no publish step; the site
picks up the changes when you reload it. The top bar shows the save state, from
"Saving shortly" to "Up to date", on every screen of the editor.

You also move around with that top bar: **Home** for the dashboard, then
**Trips**, **Places**, **Companies**, and **Settings**. On a phone it sits at
the bottom of the screen.

> Do not hand-edit files under `data/` while the editor is open. The editor
> holds the file in memory and will write its own copy back over yours. Close
> the editor first, or make the change through the editor.

## 3. Where your content lives

Everything you author lives in one folder:

```text
data/
├── site.config.json          Global settings
├── cities/
│   └── IT/                   A country, by its two-letter code
│       └── Rome/Rome.json    A city in it
├── trips/
│   └── rome-trip-2026.json   One trip
├── photos/
│   └── Italy/Rome/tr_150826_180826.json   Photo list for one stay
└── logos/
    └── Ryanair.svg           Transport company logos
```

`data/` and `media/` are not stored in git. They stay on your machine, and a
fresh clone of the repository starts empty. Your photos and logos exist only on
your disk (and on your CDN, if you use one), so keep your own backup of them;
see [section 11](#11-backups).

## 4. Adding places

You do not write country files. Every country on the world map is built into
the app under its two-letter ISO code (`IT`, `JP`, `GB`), with its name,
continent, currency, map colour and passport stamp. A few disputed territories
without an ISO code use an `X` code, such as `XK` for Kosovo. A city names its
country by that code, and the editor fills it in for you.

To add a city, open a trip and click **Add place**. You can either:

- search a worldwide city database by name, or
- paste a Google Maps link and let the editor read the coordinates out of it
  (short `goo.gl` links work too).

Coordinates and time zone come from the database. Population is optional and
only affects how prominently the map labels the city.

To find a place you already have, use the **Places** card on the editor home
page. Its search box is fuzzy and ignores filler words, so `the city of rome`,
`roma` and even the typo `rme` all find Rome. It also matches on country, so
`japan` lists every Japanese city.

### Choosing a city's Places background

Open **Places**, choose the city, then go to **Background images**. The editor
shows every photo manifest attached to a stay in that city. Click a thumbnail
to make it the city's card background in the public **Places** tab, then save
the city.

The order matters: the first image is the Places background, the second is used
for the city's second visit, and so on. When there are more visits than images,
the list starts again from the first image. You can edit that order directly
under **Image order (advanced)**. If the city has no attached gallery, enter a
CDN-relative full-size image path there instead.

## 5. Creating a trip

1. On the editor home page, click **New trip**.
2. Give it a title, say where you started from, and enter the day you left.
3. Answer one question until the trip is done: **What happened next?**

A trip is made of three kinds of piece:

| Piece        | What it means                                                   | Example                                    |
| ------------ | --------------------------------------------------------------- | ------------------------------------------ |
| **Travel**   | Getting somewhere, in one or more rides                         | Cagliari → Bergamo → Bucharest (2 flights) |
| **Stay**     | Where you slept, and for how many nights                        | Slept in Bucharest · Nights 1–4            |
| **Day trip** | Out and back to your stay on one day, with any number of places | Bucharest → Sinaia → Brașov → Bran → back  |

After each step the editor offers only the steps that can follow:

- After travelling: **I slept in …** (type the nights), **Keep travelling**, or
  **Go back home**.
- After a stay: **Travel from … to …** or **Go back home**.
- Inside a stay: **Add a day trip**, then **Add another place to this day trip**.
  The editor adds the ride back to your stay for you.

A connecting airport or a station change is another ride in the same journey.
The site shows it as a change and never as a place you visited. If you did get
out and look around a place on the way, open that ride and tick **I stopped
and looked around here**.

Click any ride to fill in its details: how you travelled, departure and arrival
in local time (the editor shows which time zone), distance, duration, airline
and flight number. If you leave distance or duration empty, the site shows an
estimate marked "about".

### Future trips

A trip whose start date is in the future counts as planned:

- it does not appear in the site's trip list, timeline, or statistics
- its cities do appear under **Places → Future**

You do not mark a trip as future. The start date decides it, and the trip stops
being future once that date passes.

## 6. Adding photos

### Uploading from the editor

1. Open the trip and find the stay (or the place on a day trip) the photos
   belong to.
2. Click **Upload photos**.
3. Choose **This computer** or **Bunny CDN**, then drop the photos and videos
   in. Each file shows its own progress bar.

The editor resizes every photo into a full-size and a thumbnail WEBP, stores
them, and adds them to that visit's gallery. Videos need
[ffmpeg](https://ffmpeg.org/) installed. They get a thumbnail, and you add the
YouTube id afterwards with **Import…**.

To upload to Bunny CDN, put these in `apps/travel-map/env/.env`. Only the
editor's server reads them, and they never reach a browser:

```bash
CDN_STORAGE_ZONE_NAME="your-zone"
CDN_STORAGE_ZONE_REGION=""
CDN_STORAGE_ZONE_API_KEY="your-storage-api-key"
CDN_BASE_STORAGE_PATH="Travels"
```

### Using the Python uploader

The uploader script still works. It takes two steps: process the photos, then
attach them to a stay.

### One-time uploader setup

```bash
cd scripts/uploader
python -m venv venv
venv/Scripts/activate      # macOS or Linux: source venv/bin/activate
pip install -r requirements.txt
cp env/example.env env/.env
```

Open `env/.env` and adjust the image size limits if you like. Fill in the
`CDN_*` values only if you plan to upload to BunnyCDN; leave them alone for
local hosting.

### Step 1: process the photos

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
- `-C` is the country's folder under `photos/` and on the CDN, written out in
  words such as `Italy`
- `--local` keeps everything on your machine. Leave it off to upload to
  BunnyCDN instead.

Each photo becomes two WEBP files, a full-size one and a thumbnail. Videos get
a thumbnail taken from their first frame. The result:

| Where                        | What                                       |
| ---------------------------- | ------------------------------------------ |
| `media/Travels/Italy/Rome/`  | The optimized image files (with `--local`) |
| `scripts/uploader/Rome.json` | A list describing them, for step 2         |

### Step 2: attach them to a stay

1. In the editor, open the trip and click the stop the photos belong to.
2. Next to **Photo manifest**, click **Import…**.
3. Paste the contents of `scripts/uploader/Rome.json`, or pick the file.
4. Click **Review**.

The editor works out the filename and location from the stop's city and dates,
so you never name the file yourself. The review step shows:

- how many photos it found, and exactly where it will save them
- a warning if a file already exists there, with the choice to **Replace** or
  cancel
- a box for a YouTube video ID on each entry that is a video

Confirm, and the stop is linked to its photos. The gallery works immediately.

A video you leave without an ID is saved and flagged for you to finish later.
It stays out of the published gallery until it has one, so visitors never see
an empty player.

## 7. Choosing where photos are served from

Photos can come from your own machine or from BunnyCDN. One setting in
`apps/travel-map/env/.env` decides which:

```bash
# Serve from your own media/ folder
VITE_CDN_PATH="/media"

# Or serve from BunnyCDN
VITE_CDN_PATH="https://your-zone.b-cdn.net/TravelMap"
```

Restart `pnpm dev` after changing it.

The site treats both the same way, so you can switch back and forth. If you
want a path prefix other than `/Travels` inside `media/`, change **Media root**
in the editor's Settings screen _before_ processing photos, because it is
written into the photo lists as they are created.

## 8. Transport companies and logos

Airlines and ferry, bus and taxi companies are defined once and reused by every
trip.

1. In the editor, open **Companies**.
2. Add the operator with an **id**, a display **name**, its **type**, and a
   **logo**.
3. In a trip, pick the operator from the dropdown on a ride of that type.

The type decides which rides offer the company and where it is listed on the
statistics page. A company with no type is offered on every ride and listed by
the rides it ran.

Your trips store the **id**, and it must match exactly. Use lowercase with
underscores, like `ryanair` or `ita_airways`. If a company shows up on the
statistics page as a raw id with no logo, the id on the leg does not match the
id in Companies.

Logos are stored in `data/logos/`, and uploading one through the editor puts it
there for you. They are bundled into the site automatically, so publishing them
needs no extra step.

## 9. Site settings

The editor's **Settings** screen holds every global setting:

| Setting                                | What it does                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Site name, domain, description, author | Page title, search metadata, and the custom domain used when publishing                                          |
| Locales                                | Extra languages you can write translated names in                                                                |
| Home city                              | Your own city, shown with its own marker                                                                         |
| Nationality                            | Colours the passport page's cover like your own passport. Without one, the home city's country is used           |
| Lived cities                           | Places you have lived. Like layovers, these are kept out of visited places and statistics, as their own category |
| Future cities                          | Places to show as planned even without a trip for them yet                                                       |
| Media root                             | The path prefix written into new photo lists (default `/Travels`)                                                |
| Map defaults                           | Starting zoom, centre, and marker sizes                                                                          |
| UNESCO sites                           | Site names for each country you have places in, shown in statistics                                              |

## 10. Fixing validation problems

The editor checks your content continuously. Every trip shows a badge, and the
**Validation** tab at the bottom of a trip lists the details, with a one-click
fix where one exists.

There are three levels:

| Level          | Meaning                                                             |
| -------------- | ------------------------------------------------------------------- |
| **Blocking**   | Wrong, for example a ride that arrives before it leaves. Fix these. |
| **Warning**    | Worth fixing, but the site still works.                             |
| **Suggestion** | Cosmetic or informational.                                          |

The most common warning is **"The journey before X ends in Y"**: the last ride
of a journey does not arrive where the next stay is. Use the one-click fix, or
open the ride and change where it was going.

## 11. Backups

Because `data/` is not in git, the editor keeps its own backups. Every risky
action writes a full snapshot to `.data-snapshots/`, and the editor keeps the
last 30.

Open **Settings → Backups** to take one by hand, restore an earlier one, or
download one as a single file. Snapshots cover everything you have authored
(trips, cities, countries, settings, photo lists) but not the image files
themselves. Keep your own copy of `media/` and your original photos.

## 12. Running the finished site with Docker

To run the built site on your own machine or server:

```bash
docker compose -f docker/compose.yml up --build
```

The site is then at <http://localhost:8080>, with your photos served from
`media/`.

`media/` is mounted live, so adding or replacing photos needs no rebuild: drop
the files in and reload. Changing trips, cities or settings does need a
rebuild, because that content is compiled into the site:

```bash
docker compose -f docker/compose.yml up --build
```

## 13. Publishing to GitHub Pages

```bash
pnpm --filter travel-map deploygh
```

This builds the site and pushes it to the `gh-pages` branch. The custom domain
comes from the **domain** field in Settings.

The site's Settings page shows which build is live, such as
`v1.0.0 · abc1234 · 1 Nov 2026`. The build fills in the commit and date; to
publish a new version number, change `version` in
`apps/travel-map/package.json` first. A Docker build has no git history, so its
line leaves the commit out.

Before publishing, decide where photos should come from. GitHub Pages serves
only the site, so `VITE_CDN_PATH` must point at BunnyCDN (or another host). A
`/media` path has nothing behind it there.

## 14. Command reference

Run these from the repository root unless noted.

| Command                                           | What it does                                               |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `pnpm install`                                    | Install everything (first time, and after pulling changes) |
| `pnpm dev`                                        | Start the site and the editor together                     |
| `pnpm editor`                                     | Start only the editor                                      |
| `pnpm build`                                      | Build the production site into `apps/travel-map/dist`      |
| `pnpm check`                                      | Verify the code is healthy; run before committing          |
| `pnpm --filter travel-map preview`                | Preview the built site locally                             |
| `pnpm --filter travel-map deploygh`               | Publish to GitHub Pages                                    |
| `docker compose -f docker/compose.yml up --build` | Run the built site plus your photos                        |
| `python main.py -c <City> -C <Country> --local`   | Process photos locally (from `scripts/uploader/`)          |
| `python main.py -c <City> -C <Country>`           | Process photos and upload to BunnyCDN                      |
| `python main.py --help`                           | Uploader options                                           |
