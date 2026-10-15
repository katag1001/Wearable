// The bottom tabs: Today / Wardrobe / Outfits / Profile (the web header's
// Home / Clothes / Matches / User).

import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";

import { colors, fontSizes, fontWeights } from "@core/theme/tokens.js";

const tabIcon =
  (name) =>
  ({ color, size }) => <Feather name={name} size={size} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarLabelStyle: {
          fontSize: fontSizes.tag,
          fontWeight: fontWeights.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: tabIcon("sun") }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{ title: "Wardrobe", tabBarIcon: tabIcon("grid") }}
      />
      <Tabs.Screen
        name="outfits"
        options={{ title: "Outfits", tabBarIcon: tabIcon("layers") }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: tabIcon("user") }}
      />
    </Tabs>
  );
}
