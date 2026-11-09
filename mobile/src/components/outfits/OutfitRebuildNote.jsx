// "Updating your outfits…" while a preference change rebuilds them in the
// background (outfitRebuild/OutfitRebuildProvider.jsx) - on Today,
// Wardrobe and Outfits. Nothing otherwise.

import { useOutfitRebuild } from "../../outfitRebuild/OutfitRebuildProvider";
import { SoftNote } from "../soft";

export const OutfitRebuildNote = () => {
  const { updating } = useOutfitRebuild();

  return <SoftNote text={updating ? "Updating your outfits…" : null} type="info" />;
};
