// Add or edit a clothing item / pair of footwear (?kind=clothing|footwear).
// The item being edited is handed over by the wardrobe (itemHandoff); with
// none, it's a new item. The form logic is useWardrobeItemForm, shared
// with the web.

import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { getErrorMessage } from "@core/api/errors.js";
import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";
import { spacing } from "@core/theme/tokens.js";
import {
  WARDROBE_KINDS,
  deleteWardrobeItem,
} from "@core/wardrobe/itemKinds.js";

import {
  Button,
  EmptyState,
  Message,
  Screen,
  TextField,
} from "../../components/ui";
import { ItemDetailsPage } from "../../components/wardrobe/ItemDetailsPage";
import {
  markWardrobeChanged,
  takeItem,
} from "../../components/wardrobe/itemHandoff";
import { PhotoPicker } from "../../components/wardrobe/PhotoPicker";
import { TypeChooser } from "../../components/wardrobe/TypeChooser";

export default function EditItemScreen() {
  const params = useLocalSearchParams();
  const kind = WARDROBE_KINDS[params.kind] ? params.kind : "clothing";

  const [item] = useState(() => takeItem());
  const [deleting, setDeleting] = useState(false);

  const form = useWardrobeItemForm({
    kind,
    item,
    onSaved: markWardrobeChanged,
    // One scrolling page, not the web's two.
    singlePage: true,
  });

  // An edit opened without its item (e.g. after a reload) can't work.
  useEffect(() => {
    if (params.edit && !item) {
      router.back();
    }
  }, [params.edit, item]);

  const deleteItem = async () => {
    setDeleting(true);

    try {
      await deleteWardrobeItem(kind, item._id);
      markWardrobeChanged();
      router.back();
    } catch (err) {
      setDeleting(false);
      Alert.alert("Delete", getErrorMessage(err, "Failed to delete item"));
    }
  };

  const confirmDelete = () =>
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteItem },
    ]);

  /* -------------------- Saved -------------------- */

  if (form.savedItem) {
    return (
      <>
        <Stack.Screen options={{ title: form.title }} />
        <Screen scroll={false} edges={["bottom"]}>
          <EmptyState title={form.savedItem.message} />
          {form.hasMatches && (
            <Button
              label="View new matches"
              variant="secondary"
              onPress={() =>
                // Back to the tabs, on Outfits, waiting for the outfits
                // being made with this item.
                router.navigate({
                  pathname: "/outfits",
                  params: { item: form.savedItem.id, processing: "1" },
                })
              }
            />
          )}
          {!form.isUpdate && (
            <Button
              label="Add another item"
              variant="secondary"
              onPress={form.addAnother}
            />
          )}
          <Button label="Done" onPress={() => router.back()} />
        </Screen>
      </>
    );
  }

  /* -------------------- Form -------------------- */

  return (
    <>
      <Stack.Screen options={{ title: form.title }} />
      <Screen edges={["bottom"]}>
        <TextField
          label="Name"
          value={form.formData.name}
          onChangeText={(text) => form.updateField("name", text)}
          onEndEditing={form.fillDetailsFromName}
          placeholder="e.g. Navy linen shirt"
        />

        <PhotoPicker
          selectedImage={form.selectedImage}
          savedImageUrl={form.formData.imageUrl}
          onPick={form.setSelectedImage}
        />

        <TypeChooser form={form} />

        <ItemDetailsPage form={form} />

        <Message text={form.validationMessage} />
        <Message text={form.error} />

        <View style={styles.actions}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => router.back()}
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

        {form.isUpdate && (
          <Button
            label="Delete item"
            variant="text"
            onPress={confirmDelete}
            loading={deleting}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
