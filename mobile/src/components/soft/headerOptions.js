// The stack header in the soft look: transparent, so the page's background
// runs up behind the back arrow and title; no shadow line. The title is
// type.menuTitle (light, like a page title in a top panel); the back arrow
// is soft/BackButton, set where the header is used
// (app/(tabs)/(today,wardrobe,outfits,create,plan)/_layout.jsx).
// Spread into a Stack's screenOptions or a screen's options. A transparent
// header doesn't push the page down, so page wrappers start below it
// themselves (useHeaderSpace).

import { ink, type } from "../../theme/soft";

export const softHeader = {
  headerTintColor: ink.soft,
  headerShadowVisible: false,
  headerTransparent: true,
  headerStyle: { backgroundColor: "transparent" },
  headerTitleStyle: {
    fontFamily: type.menuTitle.fontFamily,
    fontSize: type.menuTitle.fontSize,
    color: type.menuTitle.color,
  },
};
