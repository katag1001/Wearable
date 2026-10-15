// The add / edit item form, opened over the wardrobe as a modal.

import { Stack } from "expo-router";

import { colors, fontWeights } from "@core/theme/tokens.js";

export default function ItemLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.main,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: fontWeights.semibold },
        headerStyle: { backgroundColor: colors.pageBackground },
      }}
    />
  );
}
