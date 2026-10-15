// The screens opened from the Profile tab, each with a back button.

import { Stack } from "expo-router";

import { colors, fontWeights } from "@core/theme/tokens.js";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.main,
        headerShadowVisible: false,
        headerBackTitle: "Profile",
        headerTitleStyle: { fontWeight: fontWeights.semibold },
        headerStyle: { backgroundColor: colors.pageBackground },
      }}
    >
      <Stack.Screen name="weekly" options={{ title: "Weekly preferences" }} />
      <Stack.Screen name="style" options={{ title: "Style preferences" }} />
      <Stack.Screen name="stats" options={{ title: "Your favourites" }} />
    </Stack>
  );
}
