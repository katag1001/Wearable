# Footwear

Footwear lives in its own `Footwear` collection, separate from `Clothes`.
It is **never matched into outfits**: adding, editing or deleting footwear
doesn't create, re-check or remove any matches.

## Where it shows

My Wardrobe (`/clothes`, `src/pages/Clothes.jsx`) has a 5th type button,
**Footwear**. Selecting it swaps the page to the footwear list (its own
search, filter panel and subtype row). With no button selected, or any
other button, the page shows clothes as before.

Each list has its own session cache (`clothes` / `footwear` in
`src/context/PagedCacheProvider.jsx`); only the one on show fetches.

## Adding and editing

| File | Role |
|---|---|
| `src/components/clothes/addWardrobeItem.jsx` | Add Item: choose Clothing or Footwear, then opens that form. Editing skips the choice. |
| `src/components/footwear/addUpdateFootwear.jsx` | The two-page footwear modal, validation and saving |
| `src/components/footwear/footwearModalOne.jsx` | Page one: name, image, type (all types shown - no category step) |
| `src/constants/footwearOptions.jsx` | Types per gender, their default seasons/tags, and name synonyms |

Page two is clothing's `ModalTwo`, and the form state and auto-fill reuse
`useClothingForm` and `useClothingDetection`, so footwear is pre-filled
from its name and type exactly like clothing (Part 1 of
`clothing-and-matching-flow.md`). Style is `Patterned` when there's more
than one colour, otherwise `Plain`, and isn't shown.

Unisex footwear is every type from the woman and man lists (as with
clothing).

## Server

| File | Role |
|---|---|
| `server/models/AllModels.js` | `footwearSchema` - like clothes but no `type` (role). Has the worn fields ready for later. |
| `server/controllers/footwearControllers.js` | CRUD for `/footwear`, plus cleanup on account deletion |
| `server/services/footwearQueryService.js` | Search / filters / paging for `GET /footwear/?page=` |

`GET /footwear/options` returns `{ colors, styles, tags, subtypes }`.

Replacing a footwear image on update deletes the old Cloudinary image on
the server. Deleting footwear deletes its image.
