# Cost per user — the model behind the cost page

Made 2026-11-12. The page is published at
https://claude.ai/artifact/JkNKpRKXQWTqZsEPGR6Tt9 and its source is
`context/cost-plan.html`. To update it: change the figures here, then the
same numbers in the HTML (the tables and the constants at the top of its
`<script>`), and republish to the same URL.

When a service changes, update its row in **Unit figures**, re-measure if
the change affects usage (see **Re-measuring**), and recompute the four
per-user numbers.

## Setup being priced

- Tier 1: wardrobe capped at 70 pieces. Tier 2: unlimited, taken as 200.
- 5% of users on tier 2.
- New user: adds the whole wardrobe in month 1. After that: tier 1 swaps
  1 piece a month (stays at the cap), tier 2 adds 2.5 pieces a month.
- Every user has AI analysis on (opt-out users still pay for background
  removal, they only skip Gemini).
- Wardrobe split: 83% clothes, 17% shoes (same as the user's own).

## Result (2026-11-12)

| | First month | Each month after |
|---|---|---|
| Tier 1 | $3.16 | $0.25 |
| Tier 2 | $9.09 | $0.77 |
| 95/5 mix | $3.46 | $0.28 |

Fixed plan fees ≈ $197/month (Vercel Pro 20, Cloudinary Plus 99, Atlas
Flex ≤30, Open-Meteo Standard 29, Expo Starter 19), plus Google Play $25
once and Apple $99/year if iOS.

## Tier 2 price (added 2026-11-12)

Tier 1 is free; tier 2 pays the whole monthly bill (all users' usage +
plan fees). 70% of the price is profit and 15% is the app store cut, so
15% of the price covers costs:

`price = (monthly bill ÷ tier 2 users) ÷ (1 − 0.70 − 0.15)`

Growth assumption: a share of users is new each month (default 10%).

| Users (10% new/month) | Bill | Tier 2 users | Cost each | Price |
|---|---|---|---|---|
| 500 | $366 | 25 | $14.64 | $97.59 |
| 1,000 | $612 | 50 | $12.24 | $81.61 |
| 5,000 | $2,812 | 250 | $11.25 | $74.99 |
| 50,000 | $27,894 | 2,500 | $11.16 | $74.38 |

At 5,000 users by growth: 2% → $42.83, 5% → $54.89, 10% → $74.99,
25% → $135.29. With 10% on tier 2 instead of 5%: ~$43.29 at 5,000 users.
Tier 1 users are ~87% of usage costs in a growing app.

USD before VAT (UK store prices include 20%). If the 70% were taken on
what's received after the store cut instead: cost ÷ 0.3 ÷ 0.85 (~$44 at
5,000 users, 10% growth).

## Option B: free first month, then everyone pays (added 2026-11-12)

No free tier. Every new user gets one free, unlimited month (adds ~200
pieces), then pays or leaves. Leavers' data is kept 1 month, then
deleted. Paying users add 2.5 pieces/month; a share cancel each month.

Levelled-off paying users = trials a month × conversion ÷ monthly
cancellation. Price = monthly bill ÷ paying users ÷ (1 − profit share −
store cut).

Defaults: 1,000 trials/month, 30% convert, 5% cancel/month → 6,000
payers; cost per payer $2.12/month; break-even $2.49; at 70% profit
share **$14.11/month** (vs Option A's $75 at 5,000 users).

By conversion: 10% → $36.55, 20% → $19.72, 30% → $14.11, 50% → $9.62.
Build-up (1,000 trials/month from day one): month 2 $210, month 6 $52,
month 12 $29, month 24 $19, levelled off $14.

Conversion and cancellation rates are guesses, not measured. Risk: the
only upload limit is 200/day, so one trial could add ~6,000 pieces
(~$250) — a trial piece cap is advised.

## Unit figures

What each service costs and which code drives it.

| Service | Unit cost used | Driven by |
|---|---|---|
| Cloudinary transformations | 85 per added photo (75 background removal + ~10 resized versions) × $0.44/credit (1 credit = 1,000 tx) = **$0.037/photo** | `server/services/backgroundRemovalService.js` (`e_background_removal`, 75 tx), `analysisImageService.js` (1024px copy), `core/utils/getImageUrl.js` sizes (150–900, each new size = 1 tx per image) |
| Cloudinary storage | **3.2 MB per piece** × $0.44/GB/month | original upload (~2.5 MB, never shrunk), `_nobg` (~85 KB), `_thumb` (~10 KB), derived versions |
| Cloudinary delivery | **0.17 GB per user per month** × $0.44 | every image shown in the apps |
| Gemini 3.5 Flash-Lite | **$0.0044 per analysed photo** ($0.30 / $2.50 per M tokens in/out) | `server/services/geminiClient.js`, one call + up to 1 retry (`constants/itemAnalysis.js`) |
| MongoDB Atlas | **~1.4 KB per saved outfit** (data + index), outfits ≈ 5,672 × (clothes ÷ 98)^2.5; shared out at ~$10/GB | `matches` collection, filled by `matchService.js` (≤2,000 new per piece). 70 pieces ≈ 1,500 outfits / 2.3 MB; 200 pieces ≈ 21,000 / 30 MB |
| Vercel | ~$0.0003 per piece added (matching + analysis), ~$0.005 per user per month of daily use. Active CPU $0.128/h, memory $0.0106/GB-h, $0.60/M calls | `api/index.vercel.js`, matching runs via `waitUntil` |
| Open-Meteo | ~45 calls per user per month; $29 per 1M (Standard) | `core/weather/openMeteo.js` (one call a day, cached) |
| Expo EAS Update | $0.005 per monthly active user above 3,000 | OTA updates on the `preview` channel |

Per added photo, all services: **≈ $0.042** (Cloudinary 0.037 + Gemini
0.0044 + Vercel 0.0003).

## Plan steps (where fixed costs jump)

- **Cloudinary:** Plus $99 = 225 credits, Advanced $249 = 600, then an
  Enterprise quote. Credits per user: new tier 2 ~18, new tier 1 ~6.3,
  existing tier 1 ~0.5, existing tier 2 ~1.0. The first limit to hit.
- **Atlas:** Flex $8–30 up to 5 GB, M10 ~$57 (10 GB), M20 ~$146 (20 GB),
  M30 ~$394 (40 GB), M40 ~$760 (80 GB).
- **Open-Meteo:** Standard $29 = 1M calls, Professional $99 = 5M. The free
  API is non-commercial only.
- **Expo:** Starter $19 incl. 3,000 update users; Production $199 incl. 50,000.
- **Vercel:** Pro $20 includes $20 of usage. Hobby is non-commercial only.

## Measured inputs (2026-11-12)

- Cloudinary, last 30 days: 13.12 credits, 12,571 transformations (130
  background removals), 400 MB stored for 127 photos, 2,473 derived
  versions, 174 MB delivered. Average sizes: original 2,558 KB, `_nobg`
  85 KB, `_thumb` 10 KB.
- MongoDB: 98 clothes, 20 footwear, 5,672 matches (avg 758 B, 3.4 MB
  on disk, 4.3 MB index). Other collections under 0.3 MB together.
- Gemini: prompt v3 on 122 photos cost $0.54.

## Re-measuring

Both are read-only. Run from the project root.

Cloudinary usage and average image sizes:

```js
node -e '
require("dotenv").config({path:"server/.env"});
const c=require("./server/cloudinary.js");
(async()=>{
const u=await c.api.usage();
console.log(JSON.stringify({credits:u.credits,storage:u.storage,bandwidth:u.bandwidth,transformations:u.transformations,resources:u.resources,derived:u.derived_resources}));
let all=[],next;do{const r=await c.api.resources({max_results:500,next_cursor:next});all.push(...r.resources);next=r.next_cursor}while(next);
const g={};for(const r of all){const k=r.public_id.endsWith("_nobg")?"nobg":r.public_id.endsWith("_thumb")?"thumb":"original";(g[k]=g[k]||[]).push(r.bytes)}
for(const k in g){const a=g[k];console.log(k,a.length,"avgKB",Math.round(a.reduce((x,y)=>x+y,0)/a.length/1024))}
})()'
```

MongoDB collection sizes:

```js
node -e '
require("dotenv").config({path:"server/.env"});
const m=require("mongoose");
(async()=>{await m.connect(process.env.MONGO);const db=m.connection.db;
for(const c of await db.listCollections().toArray()){
const s=(await db.collection(c.name).aggregate([{$collStats:{storageStats:{}}}]).toArray())[0].storageStats;
console.log(c.name.padEnd(20),"docs",s.count,"avgB",s.avgObjSize||0,"diskKB",Math.round(s.storageSize/1024),"idxKB",Math.round(s.totalIndexSize/1024))}
await m.disconnect()})()'
```

## Prices: where they came from

Third-party summaries dated November 2026, not the providers' own pages.
Check before setting subscription prices. Sources are listed at the
bottom of the page.

## Biggest levers (not built)

1. Background removal off Cloudinary (on-device, or a cheaper API) —
   about 80% of a new user's cost. See `context/background-removal-research.md`.
   **Now built** (phone cut-out, 2026-11-17): see "With the phone
   cut-out" below.
2. Shrink photos on the phone before upload (~1600px) — originals are 80%
   of Cloudinary storage, charged every month.
3. Fewer saved outfits per piece (`MAX_NEW_MATCHES_PER_ITEM`) — database
   size grows much faster than wardrobe size.

## With the phone cut-out (built 2026-11-17, not yet live)

Lever 1 above is built (`context/phone-cutout-plan.md`): the phone cuts
the garment out and only the cut-out is uploaded. Cloudinary only removes
backgrounds when a phone can't (the backup), and no original or thumbnail
is kept. Changed unit figures:

- Transformations per added photo: 85 → **~10** (the resized versions
  only).
- Storage per piece: 3.2 MB → **~0.75 MB** (ESTIMATE: the phone's WebP
  cut-out ~0.2 MB plus the resized versions ~0.55 MB; re-measure once
  live. Pieces saved with "Use original photo" store the full photo).

Same model (the page's `bill()`), $1 profit, 15% store cut:

| | Today | Phone cut-out |
|---|---|---|
| New user, first month: tier 1 / tier 2 / mix | $3.15 / $9.07 / $3.44 | **$0.76 / $2.25 / $0.84** |
| Existing user a month: tier 1 / tier 2 / mix | $0.24 / $0.75 / $0.27 | **$0.14 / $0.46 / $0.15** |
| Option A price (5,000 users, 10% new) | $14.41 | **$6.27** |
| Option B price (1,000 trials, 30%, 5%) | $3.67 | **$2.05** (cost per payer $2.12 → $0.74) |

Assumes every phone cut-out works. Each photo that falls back to
Cloudinary costs the old ~$0.033 extra, and keeps the 3.2 MB original.

**Page rebuilt 2026-11-17** (version 7, same URL): two tabs (Option A /
Option B), each with its own inputs, the charge, a "what a payment covers"
bar (free users' costs, payers' own, plan fees, profit, store cut), per-user
costs by service, the whole monthly bill, and scale tables. Shared
settings: profit $/payer, store cut, **Cloudinary fallback % (default 8%:
~5% Huawei + failures)**, AI share. Fixed costs now include Apple $99/yr
($8.25/mo), Google Play $25 once, GitHub $0 (Free plan; Vercel deploys
from it, builds run on EAS not Actions) → ≈ $205/month.

At 8% fallback, $1 profit, 15% store cut: new free user $0.95, new tier 2
$2.80, existing tier 2 $0.48 a month; **Option A $6.96** (5,000 users,
10% new, 5% pay); **Option B $2.18** (1,000 trials, 30%, 5%). At 100%
fallback the model reproduces the old figures (check: $3.15 / $9.07 /
$3.67).

## Profit as % of price + yearly plan (2026-11-17, page version 8)

- Profit is now a **% of the price** (default 30%). The store takes 15% of
  the whole price (not just the profit). Average payment a month per payer
  = cost per payer ÷ (1 − profit % − store %).
- **Yearly plan:** share of payers on it (default 30%) at a discount
  (default 17%, "2 months free"). Monthly price = average ÷ (1 − share ×
  discount); yearly = 12 × monthly × (1 − discount).
- Option B: monthly payers stay 1 ÷ cancellation months (default now
  **15%/month**, RevenueCat: lifestyle apps renew worst; ~8–10% of monthly
  subscribers left after a year); yearly payers stay 12 ÷ (1 − renewal)
  months (default renewal 30%; RevenueCat medians 23–40%).

Defaults (8% fallback): **Option A $9.42/month or $93.79/year** (5,000
users, 10% new, 5% pay; cost per payer $4.92). **Option B $2.95/month or
$29.41/year** (1,000 trials, 30% convert; ~2,940 payers; cost per payer
$1.54). Without yearly plans Option B would need $3.96/month (2,000
payers).

## Open: weather provider (2026-11-17, undecided)

Open-Meteo's free API is non-commercial only, so a paid app needs its $29
a month plan, though actual usage is ~$0.001 a user. Free alternatives
discussed (terms not yet re-checked): **Apple WeatherKit** (free up to
500,000 calls a month with the Apple developer account; works on Android
through its web API, with the secret key on the server; Apple Weather
credit required) and **MET Norway** (free for commercial use, no key;
must identify the app, respect caching, credit them; hourly data needs
converting). Either way, call it from the server and cache by area.
Switching would take $29 a month off the fixed costs.

## Page simplified to three steps (2026-11-17, page version 14)

The user found the page too confusing, so it's now:
1. **Your settings** (all at the top): monthly price, yearly price,
   share choosing yearly, store cut; new free trials for each of the 12
   months (+ "fill all"); conversion, monthly cancellation (15%), yearly
   renewal (30%), pieces in the free month (200), pieces a payer adds
   (2.5), months to keep leavers' data (1); Cloudinary fallback (8%), AI
   share (100%).
2. **How the first year turns out**: a one-line verdict plus tiles: profit
   in year 1, paid in, running costs, most out of pocket, each trial's
   lifetime value + payback month, still to come after year 1, paying at
   year end, year-1 break-even price.
3. **Month by month**: trials, paying, active; each service's bill, one-off
   (month 1: Apple $99 + Google Play $25), total; paid in (cash), stores,
   profit, running total, and what that month's trials bring over their
   lifetime.
Fixed costs, per-user costs, measured figures, assumptions and sources are
in a collapsed "How it's worked out". The levelled-off view, per-user
tables and conversion/build-up tables were removed.

Sign-ups carry on: payers keep paying in later months less cancellations.
A trial costs ~$2.80 in its free month and pays back from the next, so
late-year sign-ups show cost in year 1 and value after it (the lifetime
column and "still to come" tile balance that). Defaults ($2.99 / $29.99,
example ramp): year 1 −$3,075, still to come ~$9,938, each trial worth
$2.36 (paid back by month 4), year-1 break-even $3.86/month.

## You set the prices (2026-11-17, page version 13)

Profit % input removed. The user now sets a **monthly price** (default
$2.99) and a **yearly price** (default $29.99; the page shows the implied
discount) plus the share of payers on yearly. The page shows what's left:
profit margin (% of money paid in), profit a month/year/per payer (can go
negative), and the break-even monthly price (yearly kept in the same
proportion). Average payment a month = (1 − yearly share) × monthly +
yearly share × yearly ÷ 12.

At $2.99 / $29.99: margin 31%, profit ~$2,569/month once levelled off,
break-even $1.91/month; year 1 (example ramp) −$3,075. At $4.99 / $39.99:
margin 51%, ~$6,696/month, year 1 +$1,822.

## Email added (2026-11-17, page version 12)

Email sending: **$7 a month** fixed (in the bill, the fixed costs and the
first-year table). Fixed minimum now ≈ $212/month ($204 before Apple).
Defaults: $2.96/month or $29.45/year; year 1 with the example ramp
−$3,236.

## Option A dropped (2026-11-17, page version 11)

The user dropped Option A (free tier forever) as too expensive. The page
now has only the free-first-month model (no tabs): settings, the
levelled-off price/profit, who pays, per-user costs, the bill, tables, and
the first year month by month. Option A notes below are history.

## Profit and first year (2026-11-17, page versions 9–10)

- Each tab shows the month's money: paid in, stores' cut, running costs,
  profit (also per year and per payer); price tables have a profit column.
- **"Your first year, month by month"** (follows the open tab): 12 inputs
  for new sign-ups (example ramp 40 → 780), a "set all" helper, and a
  table per month: users, payers, Cloudinary / Gemini / Atlas / Vercel /
  weather / Expo, one-off (month 1: Apple $99 for the year + Google Play
  $25), costs, paid in (cash: yearly plans paid up front), stores, profit,
  running total. Prices come from the tab's levelled-off settings.
- With the example ramp: **Option A** costs $6,511, takes $9,678, profit
  **+$1,715** in year 1 (lowest point −$590 in month 5). **Option B** at its
  levelled-off price ($2.95) **loses $3,168** in year 1: free months come
  before payers build up. Its price would need to be higher in year 1.

## Profit switched to $1 per paying user (2026-11-12)

The page's profit control is now a fixed $ amount per paying user a
month (default $1), replacing the 70% share:

`price = (monthly bill ÷ paying users + $1) ÷ (1 − store cut)`

At $1 profit and a 15% store cut:
- Option A (5,000 users, 10% new/month, 5% pay): **$14.41/month**
  (2% growth $8.73, 25% growth $25.05; 500 users $18.40).
- Option B (1,000 trials/month, 30% convert, 5% cancel): **$3.67/month**
  (10% convert $7.63, 50% $2.87; month 2 $38, month 12 $6.26).

The 70% figures above are kept for reference.
