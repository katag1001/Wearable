// The broken heart: the whole Today page while open, for the outfit on
// screen. "Too hot" / "too cold" move its range a degree and hide it for
// today; "Mismatch" goes on to picking the two items that don't go
// together; "Can't wear this with tights" (only for an outfit there thanks
// to tights) goes on to choosing this outfit or its skirt, dress or
// shorts. Each moves on to the next outfit once saved. Shown in place of
// the page, like ShoeChooser. Android's back button goes back a step, then
// closes.
// Logic: useOutfitFeedback (shared with the web's popup).

import { useEffect, useRef } from "react";
import Feather from "@expo/vector-icons/Feather";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOutfitFeedback } from "@core/hooks/useOutfitFeedback.js";
import {
  NO_TIGHTS_ITEM,
  NO_TIGHTS_OUTFIT,
  TOO_COLD,
  TOO_HOT,
} from "@core/today/outfitFeedback.js";
import { colors, fontSizes, fontWeights, spacing } from "@core/theme/tokens.js";

import { MismatchPicker } from "../outfits/MismatchPicker";
import { Button } from "../ui";

export const OutfitFeedback = ({ today, onClose }) => {
  const insets = useSafeAreaInsets();
  const feedback = useOutfitFeedback({ today, onClose });
  const picking = feedback.step === "mismatch";
  const choosingTights = feedback.step === "tights";

  const TITLES = {
    choose: "Not this outfit?",
    mismatch: "Mismatch",
    tights: "Not with tights",
  };

  const close = () => {
    if (!feedback.saving) onClose();
  };

  const back = () => {
    if (feedback.saving) return;

    if (feedback.step === "choose") onClose();
    else feedback.backToChoices();
  };

  const backRef = useRef(back);
  backRef.current = back;

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      backRef.current();
      return true;
    });

    return () => subscription.remove();
  }, []);

  return (
    <View
      style={[
        styles.page,
        { paddingTop: insets.top + spacing.md, paddingBottom: spacing.md },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{TITLES[feedback.step]}</Text>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
        >
          <Feather name="x" size={24} color={colors.main} />
        </Pressable>
      </View>

      {picking ? (
        <MismatchPicker
          clothes={feedback.clothes}
          isSelected={feedback.isSelected}
          onToggle={feedback.toggleItem}
          canConfirm={feedback.canConfirmMismatch}
          saving={feedback.saving === "mismatch"}
          onConfirm={feedback.confirmMismatch}
          onBack={back}
        />
      ) : choosingTights ? (
        <View style={styles.options}>
          <Button
            label="Just this outfit"
            variant="secondary"
            onPress={feedback.noTightsForOutfit}
            loading={feedback.saving === NO_TIGHTS_OUTFIT}
          />
          {feedback.tightsItem ? (
            <Button
              label={`Never with this ${feedback.tightsItem.name}`}
              variant="secondary"
              onPress={feedback.noTightsForItem}
              loading={feedback.saving === NO_TIGHTS_ITEM}
            />
          ) : null}
          <Button label="Back" variant="text" onPress={back} />
        </View>
      ) : (
        <View style={styles.options}>
          <Button label="Mismatch" variant="secondary" onPress={feedback.startMismatch} />
          {feedback.offersTights ? (
            <Button
              label="Can't wear this with tights"
              variant="secondary"
              onPress={feedback.startTights}
            />
          ) : null}
          {/* tooHot moves the range up (warmer days), so today was too cold for it */}
          <Button
            label="Today's weather too cold for this"
            variant="secondary"
            onPress={feedback.tooHot}
            loading={feedback.saving === TOO_HOT}
          />
          <Button
            label="Today's weather too hot for this"
            variant="secondary"
            onPress={feedback.tooCold}
            loading={feedback.saving === TOO_COLD}
          />
          <Button label="Cancel" variant="text" onPress={close} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.pageBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  options: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
});
