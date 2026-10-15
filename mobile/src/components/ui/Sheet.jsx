// A panel that slides up from the bottom over a dimmed screen (filters).
// Tapping the dimmed area or the cross closes it. `footer` stays pinned
// under the scrolling content.

import Feather from "@expo/vector-icons/Feather";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";

export const Sheet = ({ visible, title, onClose, footer, children }) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close"
        />

        <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Feather name="x" size={22} color={colors.main} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayBackdrop,
  },
  panel: {
    maxHeight: "85%",
    backgroundColor: colors.pageBackground,
    borderTopLeftRadius: radius.lg * 2,
    borderTopRightRadius: radius.lg * 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
