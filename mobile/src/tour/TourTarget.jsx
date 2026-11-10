// Wraps an element the tour points at, registering it under `name`
// (TourProvider's useTourTarget). Lays out like a plain View.

import { View } from "react-native";

import { useTourTarget } from "./TourProvider";

export const TourTarget = ({ name, style, children }) => {
  const ref = useTourTarget(name);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
};
