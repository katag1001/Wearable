# Current trends

Trends nudge Today's outfits for people who follow them, and tell the most
fashion-conscious when an outfit is on one. They never change an outfit's
saved score.

## The question

"How much do current trends impact the way you dress?" - the style quiz's
last step (optional - Skip leaves it unanswered) and on Style Preferences.
Saved as `Preferences.trends`, 1 ("Not at all") to 5 ("Absolutely").
Unanswered counts as 1: no effect.

## What a trend is

A `Trend` document (shared by every user), edited on the web **/trends**
page by admins:

- `label` - how the Today note names it ("Long-sleeve tops with flared
  jeans"), `plural` - "are" rather than "is".
- `genders` - who it counts for (`woman` / `unisex` / `man`); empty =
  everyone.
- `pieces` - 1-4 items. Each piece has `subtype`, `colour`, `pattern`,
  `fabric` lists; a list means "any of these", an empty list "any". An
  outfit is on the trend when **every piece matches a different item**.
- `added`, `until` - ends 3 months after it's added unless a date is given
  (a date runs to the end of that day). Ended trends are ignored.

| Kind | Pieces |
|---|---|
| Combination (long-sleeve tops × flares) | `{subtype: [Long-sleeve t-shirt]}` + `{subtype: [Flared jeans, Flared trousers]}` |
| Colour of an item (white jeans) | `{subtype: [Jeans, …], colour: [White]}` |
| Colour anywhere (burgundy) | `{colour: [Burgundy]}` |
| Colour pairing (brown with light blue) | `{colour: [Brown]}` + `{colour: [Light Blue]}` |
| Pattern, fabric, or either on an item | `{pattern: [Animal print]}`, `{subtype: [jackets], fabric: [Suede]}` |

**Shoe trends** ("Burgundy loafers"): one piece with `footwear` types
(`shared/footwearByGender.json`) and maybe a colour - nothing else. A shoe
piece never matches clothing, so shoe trends **never change a score**. The
running ones go to users at 4-5 with `GET /footwear/today` (`shoeTrends`,
gender-filtered), and Today adds the note when the shoe shown with an outfit
is on one (`core/today/trendNote.js` `shoeTrendNoteText`, via
`useTodayLook`'s `shoeTrendNote`). Tick "Shoe trend" on the /trends page.

Names are checked against the app's own lists (`shared/subtypesByGender.json`,
`colors.json`, `patterns.json`, `fabrics.json`) - the page only offers those.

## Today

`server/constants/trends.js`, `server/services/trendService.js`, used by
`todayScoreService.js` when today's list is built:

| Answer | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| On one trend | 0 | 0 | +1 | +3 | +6 |
| On two or more (max) | 0 | 0 | +1 | +6 | +8 |

Trends only ever add. At **4-5** the Today card also gets a note naming the
first trend the outfit is on (`Today.trendNote`), worded from
`shared/trendMessages.json` (`{trend}`, `{is}`) - `core/today/trendNote.js`
picks one, the same all day per outfit. The web Today page shows the trend
points in its score line (`scoreBreakdown.trend`).

## Admins

`User.isAdmin`, set only with the script - no API changes it:

```
node server/scripts/setAdmin.js                                lists the admins
node server/scripts/setAdmin.js someone@example.com --confirm  makes them an admin
node server/scripts/setAdmin.js someone@example.com --remove --confirm
```

The `/trends` endpoints check the database on every request
(`middleware/adminMiddleware.js`), so removing an admin works at once. The
/trends page has no link anywhere: logged out goes to /login (ProtectedRoute),
and anyone the server refuses (403) is sent home.
