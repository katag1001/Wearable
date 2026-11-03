// The page wrapper every screen uses: the soft Atmosphere behind (running
// up behind a transparent stack header, with the content starting below
// it), safe area, standard padding, optional title, and (by default)
// scrolling.
// Keyboard avoiding is built in, so forms don't hide behind the keyboard.

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSizes, fontWeights, spacing } from "../../theme/tokens";
import { Atmosphere } from "../soft/Atmosphere";
import { useHeaderSpace } from "../soft/useHeaderSpace";

export const Screen = ({
  title,
  subtitle,
  scroll = true,
  centered = false,
  edges = ["top"],
  contentStyle,
  children,
}) => {
  const headerSpace = useHeaderSpace();

  const content = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </>
  );

  const contentStyles = [
    styles.content,
    centered && styles.centered,
    contentStyle,
  ];

  return (
    <View style={[styles.screen, { paddingTop: headerSpace }]}>
      <Atmosphere />

      <SafeAreaView style={styles.fill} edges={edges}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {scroll ? (
            <ScrollView
              contentContainerStyle={[contentStyles, styles.scrollContent]}
              keyboardShouldPersistTaps="handled"
            >
              {content}
            </ScrollView>
          ) : (
            <View style={[contentStyles, styles.fill]}>{content}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  fill: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: "center",
  },
  title: {
    fontFamily: fontWeights.light,
    fontSize: fontSizes.title,
    lineHeight: 36,
    letterSpacing: -0.3,
    color: colors.main,
  },
  subtitle: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    lineHeight: 22,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
});
