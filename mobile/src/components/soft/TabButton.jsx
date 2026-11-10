// A bottom-tab button with no press effect - the tab bar's default draws
// a dark Android ripple circle on tap. Pass as `tabBarButton`. The active
// tab's bubble (TabIcon) is the only feedback. `tourName`: the app tour's
// step pointing at this tab (src/tour).

import { Pressable } from "react-native";

import { useTourTarget } from "../../tour/TourProvider";

// The ripple, hover and press-fade settings the tab bar passes are dropped;
// everything else (onPress, accessibility, layout style) goes through.
export const TabButton = ({
  android_ripple,
  hoverEffect,
  pressOpacity,
  href,
  tourName,
  ...props
}) => {
  const tourRef = useTourTarget(tourName);

  return <Pressable ref={tourRef} {...props} />;
};
