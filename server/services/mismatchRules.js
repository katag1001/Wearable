// server/services/mismatchRules.js
//
// Whether clothing items were marked as a mismatch on the Today page
// (mismatchService.js). Pure - read from the items' `mismatchedWith`
// lists - so matching can check it on every candidate. Automatic matching
// never pairs two mismatched items (matchService.pairsWithAll,
// outfitEvaluator.validateOutfit); outfits the user builds ignore it.

// Called for every candidate in the matching search, so it's kept cheap:
// most items have an empty list.
function listsItem(item, otherId) {
  const list = item?.mismatchedWith;

  if (!list || !list.length) {
    return false;
  }

  const target = String(otherId);

  return list.some((id) => String(id) === target);
}

// Both items hold the other's id; either one is enough.
function areMismatched(itemA, itemB) {
  return listsItem(itemA, itemB._id) || listsItem(itemB, itemA._id);
}

function hasMismatchedPair(items) {
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (areMismatched(items[i], items[j])) {
        return true;
      }
    }
  }

  return false;
}

module.exports = { areMismatched, hasMismatchedPair };
