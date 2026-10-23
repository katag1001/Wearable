// The outfit screen's broken heart: straight to picking the two items that
// don't go together, in place of the screen's content. Confirming does what
// Mismatch on Today does (server/services/mismatchService.js) and calls
// `onMismatched(deletedMatchIds)`; Back - or Android's back button - just
// closes. Logic: useOutfitMismatch (shared with the web's outfit card).

import { useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet } from "react-native";

import { useOutfitMismatch } from "@core/hooks/useOutfitMismatch.js";
import { spacing } from "@core/theme/tokens.js";

import { Message, Screen } from "../ui";
import { MismatchPicker } from "./MismatchPicker";

export const OutfitMismatch = ({ match, onClose, onMismatched }) => {
  const [error, setError] = useState(null);
  const mismatch = useOutfitMismatch({ match, onMismatched, onError: setError });

  const close = () => {
    if (!mismatch.saving) onClose();
  };

  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      closeRef.current();
      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <Screen edges={["bottom"]} scroll={false} contentStyle={styles.content}>
      <Message text={error} />
      <MismatchPicker
        clothes={mismatch.clothes}
        isSelected={mismatch.isSelected}
        onToggle={mismatch.toggleItem}
        canConfirm={mismatch.canConfirm}
        saving={mismatch.saving}
        onConfirm={mismatch.confirm}
        onBack={close}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
});
