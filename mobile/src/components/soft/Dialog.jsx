// The app's pop-up questions and notices in the soft look, in place of the
// system's alerts (which can't be styled): a milk card with the panels'
// rounded corners and light rim, floating over the plum-tinted backdrop,
// a light title, a line of body text and the app's own buttons.
//
// showDialog(title, message, buttons, options) takes the same arguments as
// React Native's Alert.alert, so it can be called from anywhere - a hook,
// a plain function. Buttons are [{ text, onPress, style }]: "cancel" is
// the plain text action at the foot (and what a tap on the backdrop or
// Android's back button does); the first other button - "destructive" ones
// (Leave, Delete) included - is the main lavender pill, like Next, and any
// more are white pills. Without buttons it has an OK. `options.cancelable` lets a
// tap outside close it with no cancel button, calling `options.onDismiss`.
// One shows at a time; more wait their turn. <DialogHost /> draws them -
// it sits once at the app's root (app/_layout.jsx).

import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/tokens";
import { boxEdge, motion, radii, space, type } from "../../theme/soft";
import { Button } from "../ui/Button";

let queue = [];
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener(queue[0] ?? null));

export const showDialog = (title, message, buttons, options = {}) => {
  queue = [...queue, { title, message, buttons, options }];
  notify();
};

const closeCurrent = () => {
  queue = queue.slice(1);
  notify();
};

const variantOf = (index) => (index === 0 ? "soft" : "secondary");

export const DialogHost = () => {
  const [dialog, setDialog] = useState(queue[0] ?? null);
  const shown = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    listeners.add(setDialog);
    return () => listeners.delete(setDialog);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    shown.setValue(0);
    Animated.timing(shown, {
      toValue: 1,
      duration: motion.press,
      easing: motion.easing,
      useNativeDriver: true,
    }).start();
  }, [dialog, shown]);

  if (!dialog) return null;

  const { title, message, options } = dialog;
  const buttons = dialog.buttons?.length ? dialog.buttons : [{ text: "OK" }];
  const cancel = buttons.find((button) => button.style === "cancel");
  const actions = buttons.filter((button) => button !== cancel);

  const press = (button) => {
    closeCurrent();
    button?.onPress?.();
  };

  // A tap outside, or Android's back button.
  const dismiss = () => {
    if (cancel) {
      press(cancel);
    } else if (options.cancelable) {
      closeCurrent();
      options.onDismiss?.();
    }
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <Animated.View style={[styles.backdrop, { opacity: shown }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityLabel="Close" />

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              transform: [
                { scale: shown.interpolate({ inputRange: [0, 1], outputRange: [motion.pressedScale, 1] }) },
              ],
            },
          ]}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttons}>
            {actions.map((button, index) => (
              <Button
                key={button.text}
                label={button.text}
                variant={variantOf(index)}
                onPress={() => press(button)}
              />
            ))}
            {cancel ? (
              <Button label={cancel.text} variant="text" onPress={() => press(cancel)} />
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.gutter,
    backgroundColor: colors.overlayBackdrop,
  },
  card: {
    padding: space.lg,
    gap: space.xs,
    borderRadius: radii.card,
    borderCurve: "continuous",
    backgroundColor: colors.pageBackground,
    ...boxEdge,
  },
  title: type.menuTitle,
  message: type.body,
  buttons: {
    marginTop: space.md,
    gap: space.xs,
  },
});
