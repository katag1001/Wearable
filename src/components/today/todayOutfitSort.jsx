const todayOutfitSort = (outfits) => {
  if (!Array.isArray(outfits)) return [];

  return [...outfits].sort((a, b) => {
    const dateA = a.matchId?.lastWornDate;
    const dateB = b.matchId?.lastWornDate;

    // If neither has a date, keep original order
    if (!dateA && !dateB) return 0;

    // Outfits never worn come first
    if (!dateA) return -1;
    if (!dateB) return 1;

    // Oldest worn date first
    return new Date(dateA) - new Date(dateB);
  });
};

export default todayOutfitSort;
