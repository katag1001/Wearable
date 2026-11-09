// After a photo is analysed: the photo, then what was found - name, type
// and colours, the rest behind "Show more fields" - each with a "Change"
// that opens its picker underneath, and Save at the bottom. Which fields
// show is useAnalysedItemReview's; the editing and saving are the item
// form's (useWardrobeItemForm, filled in from the analysis).
//
// `onSwitchKind(fields)` starts the review again as the other kind
// (clothing <-> footwear) - the screen remounts this with the new kind.

import { StyleSheet, View } from "react-native";

import { useAnalysedItemReview } from "@core/hooks/useAnalysedItemReview.js";
import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";
import { WARDROBE_KINDS } from "@core/wardrobe/itemKinds.js";

import { space } from "../../theme/soft";
import { Button, FieldRow, ImageTile, Message, TextField } from "../ui";
import {
  ColoursField,
  FabricField,
  PatternField,
  TagsField,
  TightsField,
} from "./ItemDetailsPage";
import { TypeChooser } from "./TypeChooser";

export const AnalysedItemReview = ({
  kind,
  prefill,
  photoUri,
  onSaved,
  onSwitchKind,
  onChooseAnotherPhoto,
}) => {
  const form = useWardrobeItemForm({ kind, prefill, onSaved, singlePage: true });
  const review = useAnalysedItemReview(form);

  const otherKind = kind === "clothing" ? "footwear" : "clothing";

  const pickers = {
    name: (
      <TextField
        value={form.formData.name}
        onChangeText={(text) => form.updateField("name", text)}
        placeholder="e.g. Navy linen shirt"
        autoFocus
      />
    ),
    type: (
      <>
        <TypeChooser form={form} titled={false} />
        <Button
          label={`It's ${WARDROBE_KINDS[otherKind].label.toLowerCase()}, not ${WARDROBE_KINDS[kind].label.toLowerCase()}`}
          variant="text"
          onPress={() => onSwitchKind(form.formData)}
        />
      </>
    ),
    colours: <ColoursField form={form} titled={false} />,
    pattern: <PatternField form={form} titled={false} />,
    fabric: <FabricField form={form} titled={false} />,
    tights: <TightsField form={form} titled={false} />,
    tags: <TagsField form={form} titled={false} />,
  };

  const rows = (fields) =>
    fields.map(({ key, label, value, swatches }) => (
      <FieldRow
        key={key}
        label={label}
        value={value}
        swatches={swatches}
        actionLabel={review.openField === key ? "Done" : "Change"}
        onAction={() => review.toggleField(key)}
        open={review.openField === key}
      >
        {pickers[key]}
      </FieldRow>
    ));

  return (
    <>
      <ImageTile source={{ uri: photoUri }} aspectRatio={4 / 5} resizeMode="contain" />

      <View>{rows(review.mainFields)}</View>

      <Button
        label={review.showMore ? "Show fewer fields" : "Show more fields"}
        variant="text"
        onPress={review.toggleMore}
      />

      {review.showMore ? <View>{rows(review.moreFields)}</View> : null}

      <Message text={form.validationMessage} />
      <Message text={form.error} />

      <View style={styles.actions}>
        <Button label="Save" onPress={form.save} loading={form.saving} />
        <Button
          label="Choose another photo"
          variant="text"
          onPress={onChooseAnotherPhoto}
          disabled={form.saving}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: space.xs,
    marginTop: space.xs,
  },
});
