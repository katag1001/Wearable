// server/utils/clothesKey.js
//
// One string per set of clothing items, the same whatever order the ids are
// in. Saved on every match (Match.clothesKey) and unique per user, so the
// same outfit can never be saved twice - even by two matching runs at once.

function clothesKey(clothesIds) {
  return clothesIds.map((id) => id.toString()).sort().join(",");
}

module.exports = { clothesKey };
