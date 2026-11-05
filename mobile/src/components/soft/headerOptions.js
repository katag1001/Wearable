// The stack header in the soft look: transparent, so the page's background
// runs up behind the back arrow and title; no shadow line, soft ink, Inter.
// Spread into a Stack's screenOptions or a screen's options. A transparent
// header doesn't push the page down, so page wrappers start below it
// themselves (useHeaderSpace).

import { fonts, ink, textSizes } from "../../theme/soft";

export const softHeader = {
  headerTintColor: ink.main,
  headerShadowVisible: false,
  headerTransparent: true,
  headerStyle: { backgroundColor: "transparent" },
  headerTitleStyle: { fontFamily: fonts.medium, fontSize: textSizes.xl },
  headerBackTitleStyle: { fontFamily: fonts.regular },
};
