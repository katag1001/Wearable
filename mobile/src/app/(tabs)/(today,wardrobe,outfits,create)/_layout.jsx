// Each tab's own stack (expo-router shared routes: this folder becomes
// (today), (wardrobe), (outfits) and (create), one per tab). Every page
// lives in all four, so whatever opens - an outfit, an item, Profile -
// opens inside the tab it was opened from, and the tab bar stays on screen.
// `anchor` is each tab's first page.

import { Stack } from "expo-router";

import { softHeader } from "../../../components/soft";

export const unstable_settings = {
  anchor: "index",
  wardrobe: { anchor: "wardrobe" },
  outfits: { anchor: "outfits" },
  create: { anchor: "create" },
};

// Pages opened on top of a tab's first page: the soft header with just a
// back arrow (they can be reached from more than one tab).
const withHeader = (options = {}) => ({
  headerShown: true,
  ...softHeader,
  headerBackButtonDisplayMode: "minimal",
  ...options,
});

export default function TabStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" options={withHeader({ title: "Profile" })} />
      <Stack.Screen
        name="account/weekly"
        options={withHeader({ title: "Weekly preferences" })}
      />
      <Stack.Screen
        name="account/style"
        options={withHeader({ title: "Style preferences" })}
      />
      <Stack.Screen
        name="account/stats"
        options={withHeader({ title: "Your favourites" })}
      />
      <Stack.Screen name="build-outfit" options={withHeader()} />
      <Stack.Screen name="outfit" options={withHeader()} />
      <Stack.Screen name="item/add" options={withHeader()} />
      <Stack.Screen name="item/edit" options={withHeader()} />
    </Stack>
  );
}
