// Add or edit a clothing item / pair of footwear (?kind=clothing|footwear).
// The item being edited is handed over by the wardrobe (itemHandoff); with
// none, it's a new item added by hand (adding from a photo is
// item/add.jsx). An existing item shows its photo filling the page with
// the form on a pull-up panel (ItemPullUpView, like an outfit), and saves
// its changes on going back (useSaveItemOnLeave); a new one is a plain
// scrolling form with Save. The form logic is useWardrobeItemForm, shared
// with the web.

import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

import { getErrorMessage } from "@core/api/errors.js";
import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";
import {
  WARDROBE_KINDS,
  deleteWardrobeItem,
} from "@core/wardrobe/itemKinds.js";

import { Button, Screen } from "../../../../components/ui";
import {
  markWardrobeChanged,
  takeItem,
} from "../../../../components/wardrobe/itemHandoff";
import { ItemForm } from "../../../../components/wardrobe/ItemForm";
import { ItemPullUpView } from "../../../../components/wardrobe/ItemPullUpView";
import { ItemSaved } from "../../../../components/wardrobe/ItemSaved";
import { useSaveItemOnLeave } from "../../../../components/wardrobe/useSaveItemOnLeave";

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

  // An existing item saves on going back - not once it's being deleted.
  useSaveItemOnLeave({ form, enabled: form.isUpdate && !deleting });

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

  // A new item only: an existing one saves as the screen goes.
  if (form.savedItem && !form.isUpdate) {
    return (
      <>
        <Stack.Screen options={{ title: form.title }} />
        <Screen scroll={false} edges={["bottom"]}>
          <ItemSaved
            message={form.savedItem.message}
            itemId={form.savedItem.id}
            hasMatches={form.hasMatches}
            onAddAnother={form.addAnother}
          />
        </Screen>
      </>
    );
  }

  /* -------------------- Existing item -------------------- */

  // Its photo filling the page, the form on a pull-up panel (like an outfit).
  if (form.isUpdate) {
    return (
      <>
        <Stack.Screen options={{ title: form.title }} />
        <ItemPullUpView
          form={form}
          footer={
            <Button
              label="Delete item"
              variant="text"
              onPress={confirmDelete}
              loading={deleting}
            />
          }
        />
      </>
    );
  }

  /* -------------------- New item -------------------- */

  return (
    <>
      <Stack.Screen options={{ title: form.title }} />
      <Screen edges={["bottom"]}>
        <ItemForm form={form} onCancel={() => router.back()} />
      </Screen>
    </>
  );
}
