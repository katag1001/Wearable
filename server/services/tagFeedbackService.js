// server/services/tagFeedbackService.js
//
// "Not appropriate for [tag]" on the Today page, where the tag is today's
// one from the weekly preferences. The tag comes off this outfit's `tags`
// and the outfit is hidden from today's list (Today.hidden). An outfit
// without the tag is left alone.
//
// Nothing else changes: the clothing items keep their tags, scores don't
// move, and it isn't a manual edit (no `userEdited`) - so if the items'
// tags change later, the outfit's tags are worked out again from them and
// the tag may come back.

const { Match, Today } = require("../models/AllModels.js");

const isTag = (tag) => typeof tag === "string" && tag.trim() !== "";

// `tags` without `tag`, or null if `tag` isn't in them.
function withoutTag(tags, tag) {
  const current = tags || [];

  return current.includes(tag) ? current.filter((t) => t !== tag) : null;
}

// Returns { removed } (false if the outfit didn't have the tag), or
// { notFound: true }.
async function applyTagFeedback(userId, matchId, tag) {
  const match = await Match.findOne({ _id: matchId, userId }).select("tags");

  if (!match) {
    return { notFound: true };
  }

  const tags = withoutTag(match.tags, tag);

  if (!tags) {
    return { removed: false };
  }

  await Match.updateOne({ _id: match._id, userId }, { $set: { tags } });
  await Today.updateMany({ userId, matchId: match._id }, { $set: { hidden: true } });

  return { removed: true };
}

module.exports = { isTag, withoutTag, applyTagFeedback };
