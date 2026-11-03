// After an item is saved: View new matches (clothing), Add another item
// (new items) and Done. `onAddAnother` is left out for an edit.

import { router } from "expo-router";

import { Button, EmptyState } from "../ui";

export const ItemSaved = ({ message, itemId, hasMatches, onAddAnother }) => (
  <>
    <EmptyState title={message} />
    {hasMatches && (
      <Button
        label="View new matches"
        variant="secondary"
        onPress={() =>
          // Back to the tabs, on Outfits, waiting for the outfits being
          // made with this item.
          router.navigate({
            pathname: "/outfits",
            params: { item: itemId, processing: "1" },
          })
        }
      />
    )}
    {onAddAnother && (
      <Button label="Add another item" variant="secondary" onPress={onAddAnother} />
    )}
    <Button label="Done" onPress={() => router.back()} />
  </>
);
