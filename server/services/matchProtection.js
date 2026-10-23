// server/services/matchProtection.js
//
// Outfits the user has interacted with: favourited, built themselves, worn,
// or changed by hand (userEdited). The app's automatic clean-ups and
// rematching (matchRefreshService) never delete or re-score these - they
// may only refresh the labels copied from the items (colours, seasons,
// ...). A mismatch is the user's own call and keeps only favourites and
// user-built outfits (mismatchService.js). The one-off scripts in
// server/scripts are separate and say for themselves what they keep.

const { MATCH_FIELDS } = require("../constants/editableFields.js");

// Fields on the outfit edit page. Favouriting and wearing are their own
// kind of interaction, covered by isProtectedMatch directly.
const USER_EDIT_FIELDS = MATCH_FIELDS.filter((field) => !["favourite", "lastWornDate"].includes(field));

function isProtectedMatch(match) {
  return (
    !!match.favourite ||
    !!match.userMade ||
    !!match.userEdited ||
    match.lastWornDate != null ||
    (match.timesWorn || 0) > 0
  );
}

// Arrays compare as sets, so re-saving the same tags in another order
// isn't an edit.
const comparable = (value) =>
  Array.isArray(value) ? [...value].map(String).sort().join("\u0000") : String(value ?? "");

// True if `fields` (from the edit page) actually change one of the
// outfit's editable values - saving the page untouched isn't an edit.
function isManualEdit(match, fields) {
  return USER_EDIT_FIELDS.some(
    (field) => field in fields && comparable(fields[field]) !== comparable(match[field])
  );
}

module.exports = { USER_EDIT_FIELDS, isProtectedMatch, isManualEdit };
