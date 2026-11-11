// Each tab's own stack (expo-router shared routes: this folder becomes
// (today), (wardrobe), (outfits), (create) and (plan), one per tab). Every
// page lives in all five, so whatever opens - an outfit, an item, Profile -
// opens inside the tab it was opened from, and the tab bar stays on screen.
// `anchor` is each tab's first page.

import { Stack } from "expo-router";

import { softHeader, StackHeader } from "../../../components/soft";

export const unstable_settings = {
  anchor: "index",
  wardrobe: { anchor: "wardrobe" },
  outfits: { anchor: "outfits" },
  create: { anchor: "create" },
  plan: { anchor: "plan" },
};

// Pages opened on top of a tab's first page that draw over the whole
// screen (an outfit, an item, Build outfit): a back arrow and title
// (soft/StackHeader, drawn in JS so the title can't jump on a back press) -
// they can be reached from more than one tab.
const withHeader = (options = {}) => ({
  headerShown: true,
  ...softHeader,
  header: (props) => <StackHeader {...props} />,
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
      {/* The Plan tab's day and its recommendations (app/.../plan.jsx). */}
      <Stack.Screen name="plan-day" options={withHeader()} />
      <Stack.Screen name="plan-outfits" options={withHeader()} />
      {/* A new item drawn by hand hides it again (a panel page). */}
      <Stack.Screen name="item/edit" options={withHeader()} />
    </Stack>
  );
}
