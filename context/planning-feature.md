# Planning (Plan tab) - design

Status: **built 2026-11-10, not yet tested on a phone or deployed.**
Mobile app only for now; server changes also reach the web Today page.

## Where it lives

| Part | Files |
|---|---|
| Plan rules (set / remove / shoe / wear on the day) | `server/services/planService.js`, `server/controllers/planControllers.js`, routes `/plan` |
| Picking a day's outfits (shared with Today) | `server/services/dayOutfitService.js` |
| Counting a wear (shared) | `server/services/wearService.js` |
| Numbers | `server/constants/planning.js`; plans -> tags `shared/planOccasions.json` |
| Weather | `core/weather/openMeteo.js` (8 days, one call), `forecastCache.js`, `typicalWeather.js`; `core/plan/dayWeather.js`, `core/hooks/useDayWeather.js` |
| Plan logic | `core/plan/*`, `core/api/plan.js`, `core/hooks/usePlan*.js` |
| Undo of a plan worn by the server | `core/plan/plannedWorn.js` (read by useToday / useTodayFootwear) |
| Screens | `mobile/src/app/(tabs)/(today,wardrobe,outfits,create,plan)/plan.jsx`, `plan-day.jsx`, `plan-outfits.jsx`, `build-outfit.jsx?planDate=`; `mobile/src/components/plan/*` |
| Outfit shoes by hand | `PUT /match/:id/footwear`, `core/hooks/useOutfitShoes.js`, `mobile/src/components/outfits/OutfitShoes.jsx` |

## The idea

A 5th tab (calendar icon). Pick a day on a calendar, then plan the outfit
for it: **build your own** (Build Outfit, with the day's weather on top)
or **take recommendations** (the Today algorithm run for that day's
weather and a chosen plan or tag). On the day itself, the planned outfit
is what Today opens on.

## Data: the plan lives on the match

```
plannedFor: [{ date: "2026-11-14", footwear: <Footwear id or null> }]
```

- `date` is the user's **local** date as a string (no timezone slips).
- Several entries allowed: the same outfit can be planned for several days.
- **One outfit per day:** planning a day removes that date from any other
  match first.
- **Protected:** a match with a planned date is never deleted or re-scored
  by the app (add to `matchProtection.js` `isProtectedMatch` and
  `UNPROTECTED_MATCH_FILTER`). Once the day has passed it is protected
  anyway, by being worn.
- Deleting the outfit (directly or via a deleted item) just drops its plans.

## On the day: the plan becomes a real "worn today" (option 3)

- At the start of the day's first `/today/create` (sent on every app open;
  it also sends the phone's local date), the server turns today's plan into
  a real worn mark with a shared `markMatchWorn(userId, match, date)` (the
  counting moved out of `updateMatch`, allControllers.js ~834-888), then
  removes the date. Today then opens on it through the existing
  `wornToday` path: picker closed, can still switch. No rebuild, no
  special Today card.
- **Planning for today itself** marks it worn straight away (like tapping
  wear on Today); it replaces any outfit already worn today.
- **Passed days the app wasn't opened on** are marked worn on their own
  dates by the same function (counts for that date's year; `lastWornDate`
  only moves forward). Skipped when the planned outfit was already worn
  that day (no double count) or **a different outfit was worn that day**
  (date just removed).
- **Undo:** the `/today/create` response returns the "before" values
  (outfit + its clothes, and the shoe + the outfit's previous shoe list),
  and the app keeps them as its own snapshot, so wearing something else
  that morning undoes the plan's counts on that device (other devices:
  same limit as Today has now). Wearing something else ends the plan.
- Rejected alternatives: putting a future date in `lastWornDate` (shows as
  worn early, kills freshness for the outfit and its items, loses the real
  date, one date per outfit); a separate "planned" card on Today (new
  client code + special reject/hide rules).

## Shoes

- **One shoe per plan**, locked in the plan entry (`footwear`). Choosing
  or changing a plan's shoe does **not** touch the outfit's general shoe
  list (`match.footwear`) until the day.
- **On the day** the server also wears the locked shoe (same as
  `wearFootwear`: worn date + counts, then `rememberShoe` puts it first on
  the outfit). Undo via the snapshot above, seeded into the shoe box's
  `worn` record.
- **Recommendations:** each recommended outfit shows its top shoe, ranked
  on the phone with `rankFootwear` for the planned day's weather (forecast
  or estimate; the estimate has no weather code, so no rain rules) and the
  plan's tags. "Change shoes" = Today's picker. Picking the outfit saves
  the plan with the shoe on show. No extra step.
- **Shoe tags:** `rankFootwear`'s tag becomes a list (any of), like
  outfits.
- **Build your own for a date:** the Shoes chip allows **one** pair only;
  it becomes the plan's shoe. (Normal Build Outfit, not planning: several
  shoes allowed, they go to the front of `match.footwear` in pick order.)
- **Outfit view (`outfit.jsx`):** shows the outfit's shoes and lets you
  add / remove them.
- **Day screen:** outfit + locked shoe, with Change outfit / Change shoes /
  Remove plan. Changing the shoe only updates the plan entry.
- No shoe picked (or none owned): the plan has no shoe; Today's shoe box
  works as now on the day.
- Deleting a shoe: `forgetShoe` also clears it from plan entries (the plan
  stays, with no shoe).

## Weather for the planned day

- **Days 0-7:** Open-Meteo forecast, `forecast_days=8` - still one call
  (extra weighting only starts past 14 days). Cached once a day; the same
  forecast offset by weather code as Today.
- **Beyond 7 days: estimate ("typical for this time of year").** Open-Meteo
  Historical API, **hourly** temperature for the last **3 years** (daily
  min is night-time, which would make every estimate colder than Today's
  daytime ranges). Daytime-window min/max per day of year, averaged over
  the years and smoothed over +/-7 days. One-off download per location
  (~120 KB compressed, ~80 weighted calls) rounded to ~50 km; only the
  worked-out 366-day table (~6 KB) is kept on the phone. No weather code
  (offset 0). Always labelled as an estimate, e.g. "Estimate: usually
  5-10° around this time of year".
- Not doing (for now): warning when a planned day comes into forecast range
  and the outfit no longer suits it. Location is always the current one.

## Recommendations

- One code path with Today: `buildToday` splits into
  `selectOutfitsForDay` (picks, saves nothing) and `saveTodayList` (Today
  only), in its own service file (e.g. `dayOutfitService.js`).
- Planning: `POST /plan/suggest`, nothing saved. Limit **30**. Tags only
  **filter** (outfits with any of the tags), then weather tiers fill to 30,
  ranked by score + freshness (tags have no effect on the order). Freshness
  measured from the planned date; season = `getSeason(plannedDate, lat)`.
  No rejection or hidden rules. Outfits planned for other days nearby left
  out. Nothing tagged: say so and offer Build your own.
- Picking a recommendation also favourites it.
- **By plan or by tag**, starting on the weekday's tag from the weekly
  preferences. Plans map to tags (user never sees the mapping), in
  `shared/planOccasions.json`:

| Plan | Tags |
|---|---|
| Workday | Business casual, Formal office |
| Working from home | Work from home, Comfy casual |
| Lunch / brunch | Brunch / lunch, Smart casual |
| Day out | Day out, City break, Elevated everyday |
| Dinner out | Restaurant dinner, Casual dinner |
| Date night | Date night, Restaurant dinner, Drinks / night out |
| Night out | Drinks / night out, Party, Gig / concert |
| Wedding | Wedding guest |
| Formal event | Formal / black tie, Cocktail party |
| Holiday / travel | Travel day, City break, Beach / pool |
| Gym / outdoors | Gym / sport, Outdoor / hiking |
| Lazy day | Lounge / home, Comfy casual |

## Build your own for a date

Reuses `build-outfit.jsx` with a `planDate` parameter: weather for the day
on top, one shoe, and on save one server call creates the match
(user-made), favourites it and sets the plan. If the outfit already exists
(same `clothesKey`), the existing match is used instead of an error.

## Plan tab

- 5th tab, calendar icon; the route group becomes
  `(today,wardrobe,outfits,create,plan)` so Build Outfit / Outfit are
  reachable inside it.
- Custom month grid in the soft look (theme roles only), not a calendar
  library. Planned days show a marker; today highlighted; past days not
  selectable (no worn history for now). Up to ~3 months ahead.
- A tour step for the new tab (`mobile/src/tour`).
- Screens: calendar (dot on planned days) + "Coming up" list; day screen
  (weather card, plan or Recommend outfits / Build my own); recommendations
  in Today's swipe deck, starting "By tag" on the weekday's tag, no broken
  heart, heart = plan this. On the day Today shows the plan as a normal worn
  outfit (no "planned" label). Planning today itself wears it at once and
  the day screen then shows the ways to plan again (with a note).

## Known limits

- A passed day only knows the most recent wear (`lastWornDate`): if an
  outfit was worn on the planned day and again later, the check "was it
  worn that day" can't see the earlier wear.
- Undoing a plan worn by the server works on the device that received it;
  another device shows it worn but can't undo it (same as Today).
