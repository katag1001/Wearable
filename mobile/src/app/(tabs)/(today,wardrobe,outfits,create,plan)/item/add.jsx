// Adding an item from its photo: take or choose a photo (two big cards,
// like the + tab's), a loading screen
// while it's analysed (usePhotoAnalysis, shared with the web), then the
// photo with what was found - each field with a "Change" - and Save
// (AnalysedItemReview). Saving sends bubbles up over "View new matches" /
// "Add another item". If the analysis fails, the full item form opens with
// the photo attached. Adding by hand is item/edit.jsx.
//
// Before any of it, a user who hasn't said whether AI may analyse their
// photos has to answer (AiConsentPrompt). Opted out, the photo only has
// its background removed and the item form opens with it attached.

import { useEffect, useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useAiConsent } from "@core/hooks/useAiConsent.js";
import { usePhotoAnalysis } from "@core/hooks/usePhotoAnalysis.js";
import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import { WARDROBE_KIND_LIST } from "@core/wardrobe/itemKinds.js";

import { choiceTints, space, type } from "../../../../theme/soft";
import { pickImage } from "../../../../platform/imagePicker";
import { BubbleCelebration } from "../../../../components/soft";
import {
  ActionCard,
  ActionCards,
  Button,
  ImageTile,
  Loading,
  Message,
  Screen,
} from "../../../../components/ui";
import { AiConsentPrompt } from "../../../../components/wardrobe/AiConsentPrompt";
import {
  AnalysedItemReview,
} from "../../../../components/wardrobe/AnalysedItemReview";
import {
  markWardrobeChanged,
} from "../../../../components/wardrobe/itemHandoff";
import { ItemForm } from "../../../../components/wardrobe/ItemForm";
import { ItemSaved } from "../../../../components/wardrobe/ItemSaved";
import { showDialog } from "../../../../components/soft/Dialog";

// A panel page (ui/Screen's pageTitle): the back arrow and title in the top
// panel, every step in the bottom one.
const TITLE = "Add item";
const back = () => router.back();

// The full item form, with just the photo (the analysis failed).
const ReviewItem = ({ kind, prefill, onSaved, onCancel }) => {
  const form = useWardrobeItemForm({ kind, prefill, onSaved, singlePage: true });

  return (
    <Screen pageTitle={form.title} onBack={back}>
      <ItemForm form={form} onCancel={onCancel} />
    </Screen>
  );
};

export default function AddItemScreen() {
  const consent = useAiConsent();
  const useAi = consent.choice === true;
  const flow = usePhotoAnalysis({ useAi });

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
      showDialog(
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
      showDialog("Photo", err.message);
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

  /* -------------------- AI consent -------------------- */

  // The AI question first - nothing can be added until it's answered.
  if (consent.loading) {
    return (
      <Screen pageTitle={TITLE} onBack={back} scroll={false}>
        <Loading />
      </Screen>
    );
  }

  if (consent.showPrompt || consent.showSaved) {
    return (
      <Screen pageTitle={TITLE} onBack={back} centered>
        <AiConsentPrompt consent={consent} />
      </Screen>
    );
  }

  /* -------------------- Saved -------------------- */

  if (flow.step === "saved") {
    return (
      <View style={styles.fill}>
        <Screen pageTitle={TITLE} onBack={back} scroll={false}>
          <ItemSaved
            message={flow.savedItem.message}
            itemId={flow.savedItem.id}
            hasMatches={flow.savedItem.hasMatches}
            onAddAnother={addAnother}
          />
        </Screen>

        {celebrating ? <BubbleCelebration onDone={() => setCelebrating(false)} /> : null}
      </View>
    );
  }

  /* -------------------- Analysing -------------------- */

  if (flow.step === "analysing") {
    return (
      <Screen pageTitle={TITLE} onBack={back} scroll={false}>
        <Loading text={useAi ? "Analysing your item…" : "Preparing your photo…"} />
      </Screen>
    );
  }

  /* -------------------- What was found -------------------- */

  if (flow.step === "ready") {
    return (
      <Screen pageTitle={TITLE} onBack={back}>
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
    <Screen pageTitle={TITLE} onBack={back} centered={flow.step === "pick"}>
      {flow.step === "pick" && (
        <>
          <ActionCards>
            <ActionCard
              icon="camera"
              title="Take photo"
              text="Use your camera"
              tint={choiceTints.takePhoto}
              onPress={() => choose("camera")}
            />
            <ActionCard
              icon="image"
              title="Choose photo"
              text="Pick one from your photos"
              tint={choiceTints.choosePhoto}
              onPress={() => choose("library")}
            />
          </ActionCards>
          <Message text={flow.error} />
        </>
      )}

      {(flow.step === "failed" || flow.step === "manual") && (
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
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  text: {
    ...type.body,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: space.sm,
  },
  rowButton: {
    flex: 1,
  },
});
