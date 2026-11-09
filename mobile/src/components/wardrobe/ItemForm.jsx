// The add / edit item form's fields and buttons, for a useWardrobeItemForm
// `form`. Used by the edit screen and by "Review analysis" when adding
// from a photo. `footer` goes under the buttons (e.g. Delete item).
// `showPhoto={false}` leaves the photo out (the edit screen shows it
// full size behind the form's pull-up panel). `showActions={false}` leaves
// out Cancel and Save (it saves itself on leaving - useSaveItemOnLeave).

import { StyleSheet, View } from "react-native";

import { space } from "../../theme/soft";
import { Button, Message, TextField } from "../ui";
import { ItemDetailsPage } from "./ItemDetailsPage";
import { PhotoPicker } from "./PhotoPicker";
import { TypeChooser } from "./TypeChooser";

export const ItemForm = ({
  form,
  onCancel,
  footer = null,
  showPhoto = true,
  showActions = true,
}) => (
  <>
    <TextField
      label="Name"
      value={form.formData.name}
      onChangeText={(text) => form.updateField("name", text)}
      onEndEditing={form.fillDetailsFromName}
      placeholder="e.g. Navy linen shirt"
    />

    {showPhoto && (
      <PhotoPicker
        selectedImage={form.selectedImage}
        savedImageUrl={form.formData.imageUrl}
        onPick={form.setSelectedImage}
      />
    )}

    <TypeChooser form={form} />

    <ItemDetailsPage form={form} />

    <Message text={form.validationMessage} />
    <Message text={form.error} />

    {showActions && (
      <View style={styles.actions}>
        <Button
          label="Cancel"
          variant="secondary"
          onPress={onCancel}
          disabled={form.saving}
          style={styles.action}
        />
        <Button
          label="Save"
          onPress={form.save}
          loading={form.saving}
          style={styles.action}
        />
      </View>
    )}

    {footer}
  </>
);

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xs,
  },
  action: {
    flex: 1,
  },
});
