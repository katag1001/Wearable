// The stack header of a page opened on top of a tab (Build outfit, an
// outfit, a plan day...): the back arrow and the page title, drawn as the
// same PageHeader the panel pages use (Profile, Settings) instead of the
// native header. The native header drops its back arrow a moment before
// the page leaves, so its title jumped left on every back press; this one
// stays put. A page's `headerRight` option (Build outfit's Save) still
// shows on the right. Transparent, so the page's background runs up
// behind it.
// Pass as a screen's `header` option
// (app/(tabs)/(today,wardrobe,outfits,create,plan)/_layout.jsx).

import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { space } from "../../theme/soft";
import { PageHeader } from "./PageHeader";

// The height of the native header it replaces, so pages start where they did.
const BAR_HEIGHT = 56;

export const StackHeader = ({ options }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top, height: BAR_HEIGHT + insets.top }]}>
      <View style={styles.title}>
        <PageHeader title={options.title ?? ""} onBack={() => router.back()} small />
      </View>
      {options.headerRight ? options.headerRight({}) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.gutter,
  },
  title: {
    flex: 1,
  },
});
