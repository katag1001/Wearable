// A ScrollView for a PullUpPanel's content: the bottom of its content is
// padded by however much of the panel is below the screen at the stop it's
// at, so it can always scroll to its end (e.g. a Delete button), part way
// up as well as fully open. Otherwise a plain ScrollView.

import { ScrollView, StyleSheet } from "react-native";

import { usePullUpBelowScreen } from "./PullUpPanel";

export const PullUpScrollView = ({ contentContainerStyle, ...props }) => {
  const belowScreen = usePullUpBelowScreen();
  const padding = StyleSheet.flatten(contentContainerStyle)?.paddingBottom ?? 0;

  return (
    <ScrollView
      {...props}
      contentContainerStyle={[
        contentContainerStyle,
        { paddingBottom: padding + belowScreen },
      ]}
    />
  );
};
