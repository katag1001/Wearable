// Each tab's own stack (expo-router shared routes: this folder becomes
// (today), (wardrobe), (outfits) and (create), one per tab). Every page
// lives in all four, so whatever opens - an outfit, an item, Profile -
// opens inside the tab it was opened from, and the tab bar stays on screen.
// `anchor` is each tab's first page.

import { Stack } from "expo-router";

import { BackButton, softHeader } from "../../../components/soft";

export const unstable_settings = {
  anchor: "index",
  wardrobe: { anchor: "wardrobe" },
  outfits: { anchor: "outfits" },
  create: { anchor: "create" },
};

// Pages opened on top of a tab's first page that draw over the whole
// screen (an outfit, an item, Build outfit): the soft header with the plain
// back arrow (soft/BackButton) - they can be reached from more than one tab.
const withHeader = (options = {}) => ({
  headerShown: true,
  ...softHeader,
  headerLeft: () => <BackButton />,
  ...options,
});

export default function TabStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* No stack header: Profile, its preference pages and Add item draw
          their own back arrow and title in a top panel, like Today
          (ui/Screen's pageTitle). */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="account/weekly" />
      <Stack.Screen name="account/style" />
      <Stack.Screen name="account/settings" />
      <Stack.Screen name="item/add" />
      <Stack.Screen name="build-outfit" options={withHeader()} />
      <Stack.Screen name="outfit" options={withHeader()} />
      {/* A new item drawn by hand hides it again (a panel page). */}
      <Stack.Screen name="item/edit" options={withHeader()} />
    </Stack>
  );
}
