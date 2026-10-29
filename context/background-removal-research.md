# Background removal for uploaded photos — research notes

Researched 2026-10-28. Nothing has been built yet. Prices are as found on
that date and should be re-checked before committing to anything.

## How the app handles images today

- Both apps upload photos **straight from the device to Cloudinary** with an
  unsigned preset (`core/api/images.js`). The server never touches the file.
- Display goes through `core/utils/getImageUrl.js`, which inserts
  `w_{size},h_{size},c_limit,f_auto,q_auto` into the Cloudinary URL.
- `getImageUrl` is called with **6 different sizes** across web and mobile
  (150, 200, 300, 400, 500, 800). Each size is a separate derived image,
  which matters for any service that charges per unique URL.
- Backend runs as Vercel serverless functions; web and the Expo mobile app
  share `core/`.
- Colours/tags are currently detected from the item **name**
  (`detectFromName`), not the image, so background removal would not affect
  matching.

## The broad options

1. **Use the image host's own background removal** (Cloudinary, or a
   different host such as Cloudflare Images / ImageKit). Usually a URL
   parameter; least code.
2. **Dedicated background-removal API** (Photoroom, remove.bg, Picsart).
   API key must stay secret, so it needs a **new server endpoint** that
   receives the image, calls the API, then uploads the result to Cloudinary.
   Changes the upload flow on both platforms.
3. **On-device, in our own code**
   - Web: `@imgly/background-removal` (WASM/ONNX). Free per image, but a
     model download of tens of MB, slow on weak machines, and **AGPL** —
     needs a commercial licence unless the project is open source.
     Transformers.js + RMBG-1.4 is an alternative but that model is
     non-commercial.
   - Mobile: iOS Vision "subject lifting" / Android ML Kit Subject
     Segmentation via a native module. Free, fast, private. Needs a custom
     dev build (EAS already in use).
   - Downside: two separate implementations, results differ between web and
     phone; doesn't suit the shared `core/` setup.
4. **On the server, in our own code** (`rembg`, `@imgly/background-removal-node`).
   Large model + slow processing → function size and timeout problems on
   Vercel. Not recommended unless the backend moves host.
5. **An LLM call** — see the section further down. Not recommended.

## Cloudinary (current host)

- Effect: `e_background_removal`.
- **Cost: 75 transformations per use, on top of the normal 1** (76 total).
- 1 credit = 1,000 transformations, or 1 GB storage, or 1 GB bandwidth.
- Input limit 6144×6144 px (larger is scaled down).
- First on-the-fly request can return **HTTP 423** while processing; cached
  after that. Eager transformation at upload avoids this.
- Not supported on-the-fly for fetched (remote) images.

| Plan | Price | Credits / month |
|---|---|---|
| Free | $0 | 25 |
| Plus | $99/mo ($89 annual) | 225 |
| Advanced | $249/mo ($224 annual) | 600 |

**Free plan ceiling:** 25,000 tx ÷ 76 ≈ 328 removals/month if nothing else
used credits. Realistically ~180–250.

**The 6-sizes trap:** adding `e_background_removal` straight into
`getImageUrl` charges the removal once per size → ~456 tx per item → only
~50 items/month on Free. To pay once per image:
- eager transformation at upload, then resize that; or
- save removal as a named transformation and use it as a baseline (`bl_`).
Either way ≈ 76 + 6 ≈ 82 tx per item.

### Usage scenario (used for all comparisons)

An average new user, first month: uploads 100 items, views clothes/outfits
pages every few days, swipes ~10 outfits a day.

- Removal: 100 × 76 = 7,600 tx → 7.6 credits
- Resized copies: 600–1,200 tx → 0.6–1.2 credits
- Storage: ~3–5 MB per item → ~0.3–0.5 credits (recurring)
- Bandwidth: clothes page ~30 MB + outfits ~60 MB + rest ~10–20 MB
  → ~0.1 credits (assumes no device caching)
- **≈ 9 credits per new user** — removal is ~85% of it.

| | Free (25) | Plus (225) |
|---|---|---|
| New users/month (100 uploads each) | ~2–3 | **~25** |
| Without background removal | ~20 | ~200–250 |

Returning users afterwards: ~5 new items/month + carried storage + viewing
≈ 1 credit/month each, so ~200 returning users would fill Plus on their own.

Per removal on Plus: $99 ÷ 225 ≈ $0.44/credit × 0.076 ≈ **$0.03–0.04 per
image**, ~$3.30 to onboard a 100-item wardrobe. Making removal optional
(say 30% of items) brings Plus up to ~70 new users/month.

## Comparison of other services

Cost per new user = 100 background removals, 6 display sizes.

| Service | How removal is billed | Free tier | ~Cost per user | Notes |
|---|---|---|---|---|
| **Cloudflare Images** | Billed as a **normal transformation**: $0.50 per 1,000 unique, first 5,000/month free | 5,000 transformations/month ≈ ~830 items | **~$0.30** | Cloudflare doesn't charge for bandwidth. Uses the open-source BiRefNet model. |
| **ImageKit** | `e-bgremove` = **10 extension units**; AI results "cached forever" | 650 units ≈ 65 images | **~$1.80** (up to ~$10, see below) | Pro is $89/mo with 4,000 units, then $9 per 5,000 units. `e-removedotbg` (remove.bg) is 130 units. |
| **Photoroom API** | $0.02 per image | 10 free calls | **~$2** | Plans from $20/mo, unused images don't roll over. Built for product photos. Needs a server endpoint. |
| **Cloudinary Plus** | 75 + 1 tx ≈ $0.033 per image | ~300/month in theory | **~$3.30** | Current host. |
| **Picsart API** | Credits; their example says "8 credits" per removal | 5–200 credits | **~$4?** | Picsart's pages contradict each other (one says $0.0011/generation). |
| **remove.bg** | $0.23/image on small plans, ~$0.10 at volume | 50 low-res previews/month | **$10–23** | 40 credits $9/mo, 200 credits $39/mo, 10,000 credits $989. |
| **imgix** | Reportedly 2 credits per render, at $0.13–0.25/credit | 30-day trial only | **$26–50+** | Plans $25–$500/mo. |
| **Uploadcare** | **750 operations** per removal | 1,000 operations ≈ 1 image | **~$60** | Pro $66–79/mo (5,000 ops), Business $166–199/mo (50,000 ops). |

### Cloudflare Images in more detail (current front-runner)

- Parameter: `segment=foreground` (URL) or `cf: {image: {segment: "foreground"}}`
  in a Worker. "Automatically isolates the subject of an image by replacing
  the background with transparent pixels."
- Docs: "Parameters that use AI inference are billed as standard Images
  transformations" → **$0.0005 per removal**. 6 sizes = 6 transformations,
  600 per user.
- Can transform images stored elsewhere, so **Cloudinary could stay as
  storage** and the upload flow wouldn't change. (Free plan doesn't include
  storage anyway — only transforms of images held elsewhere.)
- Setup needed:
  - `/cdn-cgi/image/...` URLs run on a domain whose DNS is on Cloudflare.
    The app is on Vercel, so either a custom domain routed through
    Cloudflare or a small Cloudflare Worker.
  - Cloudinary must be added as an allowed source origin (only same-zone
    sources are accepted by default).
- Free plan limit: over 5,000/month, new transformations return error
  `9422` (cached ones keep working). The app would need to fall back to the
  original photo.
- Quality: BiRefNet is a strong general model, but untested on clothing
  here. Pale clothes on pale backgrounds are the case to check.

### Things I couldn't confirm

- **ImageKit:** whether the removal output is reused across the 6 resize
  URLs (~$1.80/user) or re-run per size (up to ~$10/user).
- **Picsart:** $0.0011 per generation vs 8 credits at $0.005–0.0075 each —
  about a 30× difference.
- **imgix:** the 2-credit figure came from their FAQ via search results;
  the credit-consumption page showed no values.
- **Cloudflare:** whether the free plan definitely covers images from an
  outside origin like Cloudinary. The pricing page suggests so but doesn't
  say it outright.

## Using an LLM instead

Not a good fit.

- **Text LLMs (Claude, standard GPT chat) can't return images** — they read
  images and reply in text.
- **Image-generation models** (OpenAI GPT Image, Google Gemini "Nano Banana")
  will "remove the background" but do it by **generating a new image**, not
  cutting out the real pixels:
  - prints, logos, texture, stitching can drift or get "tidied up";
  - **colours can shift slightly** — a problem because palettes are the
    colour gate for matching, and users expect to recognise their clothes;
  - output capped around 1K, 10–30+ seconds per image;
  - transparency inconsistent (GPT Image supports it; Gemini usually gives
    white or a fake checkerboard).

| Option | ~Per image | Per user (100 items) |
|---|---|---|
| Gemini Flash Image | ~$0.04–0.07 (about half via batch API) | ~$4–7 |
| OpenAI GPT Image, medium | ~$0.04 + input-image tokens | ~$4+ |
| OpenAI GPT Image, low | ~$0.01 | ~$1, but worse redrawing |
| *Photoroom (comparison)* | $0.02 | $2 |
| *Cloudflare Images (comparison)* | ~$0.003 for all 6 sizes | ~$0.30 |

(LLM prices from third-party trackers, not official pages.) Also needs a
server endpoint to hide the API key.

**Where a vision LLM could help instead:** reading colours, category and
pattern from the photo (currently `detectFromName` uses only the item name),
or returning a bounding box to crop around the garment. A fraction of a cent
per item.

## Recommendation so far

1. **Try Cloudflare Images first** — ~10× cheaper than Cloudinary at ~$0.30
   per heavy new user. Test on 20–30 real clothing photos before building.
2. **Second choice: Photoroom** at $0.02/image if BiRefNet quality isn't good
   enough. Needs a server endpoint.
3. **Free on phones:** on-device removal on mobile (iOS Vision / Android ML
   Kit) could sit alongside either option.

Design points to decide whatever the service:
- Automatic for every photo, or a per-item "remove background" toggle
  (a single `removeBackground` field on the item — no new collection)?
- Keep originals so removal is reversible.
- Roll out to new uploads (or ticked items) only — applying to existing
  wardrobes at once would spend a lot in one go.
- Handle the "still processing" / over-quota responses by falling back to
  the original image.

## Sources

Cloudinary
- [Background removal](https://cloudinary.com/documentation/background_removal)
- [Transformation counts](https://cloudinary.com/documentation/transformation_counts)
- [Pricing](https://cloudinary.com/pricing)

Cloudflare
- [Images pricing](https://developers.cloudflare.com/images/pricing/)
- [Transform via URL (segment)](https://developers.cloudflare.com/images/transform-images/transform-via-url/)
- [Transform images](https://developers.cloudflare.com/images/transform-images/)
- [Blog – evaluating segmentation models](https://blog.cloudflare.com/author/deanna)

ImageKit
- [How pricing works](https://imagekit.io/docs/how-pricing-works)
- [Plans](https://imagekit.io/plans/)
- [AI transformations](https://imagekit.io/docs/ai-transformations)

Background-removal APIs
- [Photoroom API pricing](https://www.photoroom.com/api/pricing)
- [Photoroom blog – API cost comparison](https://www.photoroom.com/blog/remove-bg-api-cost-leonardo-ai-vs-photoroom)
- [Picsart – Remove Background pricing](https://picsart.com/api-platform/models/picsart-sod-v8-2/pricing)
- [Picsart.io pricing](https://picsart.io/pricing)
- [remove.bg pricing](https://remove.bg/pricing)

Other image hosts
- [imgix pricing](https://www.imgix.com/pricing)
- [imgix pricing FAQ](https://www.imgix.com/pricing-faq)
- [imgix bg-remove docs](https://docs.imgix.com/en-US/apis/rendering/background-removal/bg-remove)
- [Uploadcare billing](https://uploadcare.com/docs/billing/)
- [Uploadcare pricing](https://uploadcare.com/pricing/)

LLM image models
- [GPT Image API pricing – pricepertoken](https://pricepertoken.com/gpt-image-pricing)
- [Cheapest gpt-image-1 API – perkstack](https://perkstack.co/blog/cheapest-gpt-image-1-api)
- [AI Image Pricing 2026: Gemini vs OpenAI – IntuitionLabs](https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai)
- [AI Image Model Pricing (Aug 2026) – invideo](https://invideo.io/blog/ai-image-model-pricing/)
- [Nano Banana 2 review – stacksheriff](https://stacksheriff.com/ai-tools/nano-banana-2-review/)
- [Gemini 3 Pro Image cost per image – laozhang](https://blog.laozhang.ai/en/posts/gemini-3-pro-image-api-cost-per-image)
