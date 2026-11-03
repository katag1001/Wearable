// A panel that slides up from the bottom over a dimmed screen (filters):
// milk, with big rounded corners and a grab handle, over a light
// plum-tinted backdrop. Tapping the dimmed area or the cross closes it.
// `footer` stays pinned under the scrolling content.

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
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";

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
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Feather name="x" size={22} color={colors.muted} />
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
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderCurve: "continuous",
    boxShadow: shadows.lifted,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    marginTop: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.imageBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fontWeights.light,
    fontSize: 24,
    lineHeight: 30,
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
