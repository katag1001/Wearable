// The screens opened from the Profile tab, each with a back button.

import { Stack } from "expo-router";

import { softHeader } from "../../components/soft";

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        ...softHeader,
        headerBackTitle: "Profile",
      }}
    >
      <Stack.Screen name="weekly" options={{ title: "Weekly preferences" }} />
      <Stack.Screen name="style" options={{ title: "Style preferences" }} />
      <Stack.Screen name="stats" options={{ title: "Your favourites" }} />
    </Stack>
  );
}
