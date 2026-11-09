// The way back from a page: the plain header arrow (IconButton), the same
// in a top panel (PageHeader) and in the stack header
// (app/(tabs)/(today,wardrobe,outfits,create)/_layout.jsx). Goes back
// unless given its own `onPress`.

import { router } from "expo-router";

import { IconButton } from "./IconButton";

export const BackButton = ({ onPress, label = "Back" }) => (
  <IconButton icon="arrow-left" label={label} onPress={onPress ?? (() => router.back())} />
);
