// server/services/matchLifecycleService.js
//
// Wraps deleting Match documents. Deleting an outfit - by the user, or as a
// clean-up (an item deleted or edited) - never changes the personal pair
// scores: one deleted outfit says too little about which of its pairs the
// user disliked. Marking a mismatch on the Today page is the targeted
// signal instead (mismatchService.js).

const { Match } = require("../models/AllModels.js");

async function deleteMatches(filter) {
  const result = await Match.deleteMany(filter);

  return { deletedCount: result.deletedCount };
}

module.exports = { deleteMatches };
