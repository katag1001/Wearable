// Adding an item from its photo: take or choose a photo, a loading screen
// while it's analysed (usePhotoAnalysis, shared with the web), then the
// photo with what was found - each field with a "Change" - and Save
// (AnalysedItemReview). Saving bursts confetti over "View new matches" /
// "Add another item". If the analysis fails, the full item form opens with
// the photo attached. Adding by hand is item/edit.jsx.

import { useEffect, useState } from "react";
import { router, Stack } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { usePhotoAnalysis } from "@core/hooks/usePhotoAnalysis.js";
import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";
import { colors, fontSizes, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import { WARDROBE_KIND_LIST } from "@core/wardrobe/itemKinds.js";

import { pickImage } from "../../platform/imagePicker";
import { Confetti } from "../../components/today/Confetti";
import { Button, ImageTile, Loading, Message, Screen } from "../../components/ui";
import { AnalysedItemReview } from "../../components/wardrobe/AnalysedItemReview";
import { markWardrobeChanged } from "../../components/wardrobe/itemHandoff";
import { ItemForm } from "../../components/wardrobe/ItemForm";
import { ItemSaved } from "../../components/wardrobe/ItemSaved";

const TITLE = "Add item";

const addByHand = () =>
  Alert.alert("Add item", "What would you like to add?", [
    ...WARDROBE_KIND_LIST.map(({ kind, label }) => ({
      text: label,
      onPress: () => router.replace({ pathname: "/item/edit", params: { kind } }),
    })),
    { text: "Cancel", style: "cancel" },
  ]);

// The full item form, with just the photo (the analysis failed).
const ReviewItem = ({ kind, prefill, onSaved, onCancel }) => {
  const form = useWardrobeItemForm({ kind, prefill, onSaved, singlePage: true });

  return (
    <>
      <Stack.Screen options={{ title: form.title }} />
      <Screen edges={["bottom"]}>
        <ItemForm form={form} onCancel={onCancel} />
      </Screen>
    </>
  );
};

export default function AddItemScreen() {
  const flow = usePhotoAnalysis();

  // The full item form over the flow (failed analysis): { kind, prefill } or null.
  const [form, setForm] = useState(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (flow.step === "saved") {
      setCelebrating(true);
      markWardrobeChanged();
    }
  }, [flow.step]);

  // "More than one item in this photo" (or none).
  useEffect(() => {
    if (flow.notice) {
      Alert.alert(
        flow.notice === "multiple" ? "More than one item" : "No item found",
        flow.noticeText,
        [{ text: "OK", onPress: flow.dismissNotice }],
        { onDismiss: flow.dismissNotice }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.notice]);

  const choose = async (source) => {
    try {
      const image = await pickImage(source);

      if (image) {
        flow.analysePhoto(image);
      }
    } catch (err) {
      Alert.alert("Photo", err.message);
    }
  };

  const addAnother = () => {
    setForm(null);
    setCelebrating(false);
    flow.restart();
  };

  // The background-removed photo once the analysis made it, else the one
  // picked.
  const shownPhoto = flow.imageUrl ? getImageUrl(flow.imageUrl, 900) : flow.photo?.uri;

  /* -------------------- Saved -------------------- */

  if (flow.step === "saved") {
    return (
      <>
        <Stack.Screen options={{ title: TITLE }} />
        <View style={styles.fill}>
          <Screen scroll={false} edges={["bottom"]}>
            <ItemSaved
              message={flow.savedItem.message}
              itemId={flow.savedItem.id}
              hasMatches={flow.savedItem.hasMatches}
              onAddAnother={addAnother}
            />
          </Screen>

          {celebrating ? <Confetti onDone={() => setCelebrating(false)} /> : null}
        </View>
      </>
    );
  }

  /* -------------------- Analysing -------------------- */

  if (flow.step === "analysing") {
    return (
      <>
        <Stack.Screen options={{ title: TITLE }} />
        <Loading text="Analysing your item..." />
      </>
    );
  }

  /* -------------------- What was found -------------------- */

  if (flow.step === "ready") {
    return (
      <>
        <Stack.Screen options={{ title: TITLE }} />
        <Screen edges={["bottom"]}>
          <AnalysedItemReview
            // A new form when the kind is switched.
            key={flow.kind}
            kind={flow.kind}
            prefill={flow.reviewPrefill}
            photoUri={shownPhoto}
            onSaved={(saved) => flow.markSaved(saved, flow.kind)}
            onSwitchKind={flow.switchKind}
            onChooseAnotherPhoto={flow.restart}
          />
        </Screen>
      </>
    );
  }

  /* -------------------- Fill in by hand -------------------- */

  if (form) {
    return (
      <ReviewItem
        kind={form.kind}
        prefill={form.prefill}
        onSaved={(saved) => flow.markSaved(saved, form.kind)}
        onCancel={() => setForm(null)}
      />
    );
  }

  /* -------------------- Photo -------------------- */

  const photo = shownPhoto ? (
    <ImageTile source={{ uri: shownPhoto }} aspectRatio={4 / 5} resizeMode="contain" />
  ) : null;

  return (
    <>
      <Stack.Screen options={{ title: TITLE }} />
      <Screen edges={["bottom"]}>
        {flow.step === "pick" && (
          <>
            <Text style={styles.text}>
              Take or choose a photo of one item - we'll fill in the rest.
            </Text>
            <Text style={styles.text}>Best results: daylight and a plain background.</Text>
            <ImageTile placeholder="No photo yet" aspectRatio={4 / 5} />
            <View style={styles.row}>
              <Button
                label="Take photo"
                variant="secondary"
                onPress={() => choose("camera")}
                style={styles.rowButton}
              />
              <Button
                label="Choose photo"
                variant="secondary"
                onPress={() => choose("library")}
                style={styles.rowButton}
              />
            </View>
            <Message text={flow.error} />
            <Button label="Add details by hand instead" variant="text" onPress={addByHand} />
          </>
        )}

        {flow.step === "failed" && (
          <>
            {photo}
            <Message text={flow.error} />
            <Text style={styles.text}>What is it?</Text>
            <View style={styles.row}>
              {WARDROBE_KIND_LIST.map(({ kind, label }) => (
                <Button
                  key={kind}
                  label={label}
                  variant="secondary"
                  onPress={() => setForm({ kind, prefill: flow.manualPrefill })}
                  style={styles.rowButton}
                />
              ))}
            </View>
            <Button label="Choose another photo" variant="text" onPress={flow.restart} />
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  text: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  rowButton: {
    flex: 1,
  },
});
