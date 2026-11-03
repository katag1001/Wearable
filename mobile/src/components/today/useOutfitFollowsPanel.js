// Keeps an outfit (OutfitImages, fit mode) clear of a PullUpPanel without
// re-laying it out: the outfit's space is laid out once, as if the panel
// were tucked away, and as the panel rises to `openVisible` px showing the
// outfit is shrunk (by as much as fitting it into the space left would)
// and moved up to sit in that space. Driven by the panel's own offset, so
// it follows the finger and the snap; above `openVisible` (a panel that
// opens further) it stays put and the panel covers it.
//
// Returns { onLayout, style }: onLayout for the outfit's space, style for
// an Animated.View around the outfit inside it.

import { useState } from "react";

import { PULL_UP_PEEK, stopOffset } from "../soft/PullUpPanel";
import { outfitImagesFitWidth } from "./OutfitImages";

export const useOutfitFollowsPanel = ({
  match,
  footwear,
  panelOffset,
  panelHeight,
  openVisible = panelHeight,
}) => {
  const [space, setSpace] = useState(null);

  const onLayout = (event) => setSpace(event.nativeEvent.layout);

  const openOffset = stopOffset(openVisible, panelHeight);
  const tuckedOffset = stopOffset(PULL_UP_PEEK, panelHeight);

  if (!space || !panelHeight || tuckedOffset <= openOffset) {
    return { onLayout, style: null };
  }

  const { width, height } = space;
  const openHeight = Math.max(1, height - (openVisible - PULL_UP_PEEK));
  const fullWidth = outfitImagesFitWidth(match, width, height, footwear);
  const openWidth = outfitImagesFitWidth(match, width, openHeight, footwear);
  const openScale = fullWidth ? Math.min(1, openWidth / fullWidth) : 1;

  const range = {
    inputRange: [openOffset, tuckedOffset],
    extrapolate: "clamp",
  };

  return {
    onLayout,
    style: {
      transform: [
        {
          translateY: panelOffset.interpolate({
            ...range,
            outputRange: [(openHeight - height) / 2, 0],
          }),
        },
        {
          scale: panelOffset.interpolate({
            ...range,
            outputRange: [openScale, 1],
          }),
        },
      ],
    },
  };
};
