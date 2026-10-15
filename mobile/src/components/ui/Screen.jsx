// The page wrapper every screen uses: safe area, white background,
// standard padding, optional title, and (by default) scrolling. Keyboard
// avoiding is built in, so forms don't hide behind the keyboard.

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSizes, fontWeights, spacing } from "@core/theme/tokens.js";

export const Screen = ({
  title,
  subtitle,
  scroll = true,
  centered = false,
  edges = ["top"],
  contentStyle,
  children,
}) => {
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
    <SafeAreaView style={styles.screen} edges={edges}>
      <KeyboardAvoidingView
        style={styles.screen}
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
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  subtitle: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
});
