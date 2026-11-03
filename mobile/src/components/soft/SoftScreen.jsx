// The soft page wrapper: the Atmosphere behind, safe area, the page gutter,
// and (by default) scrolling. `weather` goes to the Atmosphere.
// The soft version of ui/Screen.

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { space, surface } from "../../theme/soft";
import { Atmosphere } from "./Atmosphere";

export const SoftScreen = ({
  weather,
  scroll = true,
  edges = ["top"],
  contentStyle,
  children,
}) => (
  <View style={styles.screen}>
    <Atmosphere weather={weather} />

    <SafeAreaView style={styles.fill} edges={edges}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, styles.grow, contentStyle]}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: surface.milk,
  },
  fill: {
    flex: 1,
  },
  grow: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: space.gutter,
    paddingTop: space.pageTop,
    paddingBottom: space.sm,
    gap: space.sm,
  },
});
