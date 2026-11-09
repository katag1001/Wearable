// The bottom tabs: Today / Wardrobe / Outfits (the web header's Home /
// Clothes / Matches) and + (add an item or build an outfit). Profile is
// the person button on Today. Each tab is its own stack
// ((today,wardrobe,outfits,create)/_layout.jsx), so the bar stays on every
// page. Outfit rebuilds after a preference change run in the background
// for all of them (OutfitRebuildProvider). In the soft look: a milk bar
// with no border, a faint shadow above, and the active tab on a lavender
// bubble.

import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabButton, tabIcon } from "../../components/soft";
import { OutfitRebuildProvider } from "../../outfitRebuild/OutfitRebuildProvider";
import { ink, shadows, surface, type } from "../../theme/soft";

// Taller than the default bar (49), so the icon pill and the Inter labels
// have room. The phone's bottom inset is added on top.
const BAR_HEIGHT = 62;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <OutfitRebuildProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          // No dark ripple circle on tap.
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarActiveTintColor: ink.main,
          tabBarInactiveTintColor: ink.muted,
          tabBarStyle: {
            height: BAR_HEIGHT + insets.bottom,
            paddingTop: 8,
            backgroundColor: surface.milk,
            borderTopWidth: 0,
            elevation: 0,
            boxShadow: shadows.tabBar,
          },
          tabBarLabelStyle: {
            ...type.tabLabel,
            // A little space below lifts it clear of the bar's edge.
            marginBottom: 3,
          },
        }}
      >
        <Tabs.Screen
          name="(today)"
          options={{ title: "Today", tabBarIcon: tabIcon("sun") }}
        />
        <Tabs.Screen
          name="(wardrobe)"
          options={{ title: "Wardrobe", tabBarIcon: tabIcon("grid") }}
        />
        <Tabs.Screen
          name="(outfits)"
          options={{ title: "Outfits", tabBarIcon: tabIcon("layers") }}
        />
        <Tabs.Screen
          name="(create)"
          options={{ title: "Add", tabBarIcon: tabIcon("plus") }}
        />
      </Tabs>
    </OutfitRebuildProvider>
  );
}
