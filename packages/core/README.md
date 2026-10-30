# @travelmap/core

The domain model both apps share, in plain TypeScript with no React and no
build step.

| Folder        | Holds                                                           |
| ------------- | --------------------------------------------------------------- |
| `classes/`    | Trip, City, Country, Travel, Ferry, Flight, Color               |
| `typings/`    | Continent, Currency, Localized, Travel                          |
| `schema/`     | The Zod contracts for every authored JSON document              |
| `world/`      | `buildWorld`, dates, distances, ids, media paths, derived facts |
| `validation/` | The trip and dataset checks the editor shows its author         |
| `migration/`  | One-off migrations of older trip files                          |

`buildWorld` is the dataset's single trust boundary: it parses every document
with its schema, resolves the ids between them, and builds the linked graph
the site reads. Everything downstream of it is trusted.

Anything that works on the authored JSON or on these classes belongs here
rather than in an app, so the site and the editor can never disagree about
what a trip is.
