// The broken heart: the whole Today page while open, for the outfit on
// screen. "Too hot" / "too cold" move its range a degree and hide it for
// today; "Mismatch" goes on to picking the two items that don't go
// together. Each moves on to the next outfit once saved. Shown in place of
// the page, like ShoeChooser. Android's back button goes back a step, then
// closes.
// Logic: useOutfitFeedback (shared with the web's popup).

import { useEffect, useRef } from "react";
import Feather from "@expo/vector-icons/Feather";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOutfitFeedback } from "@core/hooks/useOutfitFeedback.js";
import { TOO_COLD, TOO_HOT } from "@core/today/outfitFeedback.js";
import { colors, fontSizes, fontWeights, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Button, Grid, ImageTile } from "../ui";

export const OutfitFeedback = ({ today, onClose }) => {
  const insets = useSafeAreaInsets();
  const feedback = useOutfitFeedback({ today, onClose });
  const picking = feedback.step === "mismatch";

  const close = () => {
    if (!feedback.saving) onClose();
  };

  const back = () => {
    if (feedback.saving) return;

    if (picking) feedback.backToChoices();
    else onClose();
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
        <Text style={styles.title}>{picking ? "Mismatch" : "Not this outfit?"}</Text>
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
        <>
          <Text style={styles.hint}>Choose the 2 items that don't go together.</Text>

          <ScrollView contentContainerStyle={styles.items}>
            <Grid columns={2}>
              {feedback.clothes.map((item) => (
                <ImageTile
                  key={item._id}
                  source={item.imageUrl ? { uri: getImageUrl(item.imageUrl, 400) } : null}
                  placeholder={item.name}
                  label={item.name}
                  selected={feedback.isSelected(item._id)}
                  onPress={() => feedback.toggleItem(item._id)}
                  aspectRatio={3 / 4}
                  resizeMode="contain"
                />
              ))}
            </Grid>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              label="Confirm mismatch"
              onPress={feedback.confirmMismatch}
              disabled={!feedback.canConfirmMismatch}
              loading={feedback.saving === "mismatch"}
            />
            <Button label="Back" variant="text" onPress={back} />
          </View>
        </>
      ) : (
        <View style={styles.options}>
          <Button
            label="Outfit too hot for today"
            variant="secondary"
            onPress={feedback.tooHot}
            loading={feedback.saving === TOO_HOT}
          />
          <Button
            label="Outfit too cold for today"
            variant="secondary"
            onPress={feedback.tooCold}
            loading={feedback.saving === TOO_COLD}
          />
          <Button label="Mismatch" variant="secondary" onPress={feedback.startMismatch} />
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
  hint: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
  items: {
    paddingTop: spacing.sm,
  },
  options: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
});
