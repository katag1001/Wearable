// The stack header in the soft look: milk, no shadow line, soft ink, Inter.
// Spread into a Stack's screenOptions or a screen's options.

import { fonts, ink, surface } from "../../theme/soft";

export const softHeader = {
  headerTintColor: ink.main,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: surface.milk },
  headerTitleStyle: { fontFamily: fonts.medium, fontSize: 17 },
  headerBackTitleStyle: { fontFamily: fonts.regular },
};
