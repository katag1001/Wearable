// A panel that slides up from the bottom over a dimmed screen (filters):
// milk, with the panels' rounded corners and light top rim (like Today's),
// a grab handle, over a light plum-tinted backdrop. It eases in and out
// over motion.panel, as panels do. Tapping the dimmed area or the cross
// closes it. `footer` stays pinned under the scrolling content.

import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/tokens";
import { boxEdge, motion, radii, space } from "../../theme/soft";
import { SheetHeader } from "../soft/SheetHeader";

export const Sheet = ({ visible, title, onClose, footer, children }) => {
  const insets = useSafeAreaInsets();
  // Kept open while it slides away after `visible` turns false.
  const [open, setOpen] = useState(visible);
  const shown = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState(Dimensions.get("window").height);

  useEffect(() => {
    if (visible) setOpen(true);

    Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: motion.panel,
      easing: motion.easing,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setOpen(false);
    });
  }, [visible, shown]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: shown }]}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
            accessibilityLabel="Close"
          />
        </Animated.View>

        <Animated.View
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          style={[
            styles.panel,
            { paddingBottom: insets.bottom + space.sm },
            {
              transform: [
                { translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) },
              ],
            },
          ]}
        >
          <View style={styles.handle} />

          <SheetHeader title={title} onClose={onClose} style={styles.header} />

          <ScrollView contentContainerStyle={styles.content}>
            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
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
    flex: 1,
    backgroundColor: colors.overlayBackdrop,
  },
  panel: {
    maxHeight: "85%",
    backgroundColor: colors.pageBackground,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: "continuous",
    ...boxEdge,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    marginTop: space.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.imageBackground,
  },
  header: {
    paddingHorizontal: space.gutter,
    paddingVertical: space.sm,
  },
  content: {
    paddingHorizontal: space.gutter,
    paddingBottom: space.sm,
    gap: space.sm,
  },
  footer: {
    flexDirection: "row",
    gap: space.sm,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
  },
});
