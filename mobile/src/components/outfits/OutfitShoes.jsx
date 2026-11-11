// The outfit's shoes on the outfit screen's details panel: the shoes
// Today shows first with it, in order, as ticked tiles - tap one to take
// it off. "Add" shows every other shoe in a row underneath - tap to add
// it at the end. Saved straight away. Nothing shows for a user with no
// footwear. Logic: useOutfitShoes.

import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useOutfitShoes } from "@core/hooks/useOutfitShoes.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { radii, space } from "../../theme/soft";
import { EmptyState, ImageTile, Message, SectionTitle, TextAction } from "../ui";

const TILE_SIZE = 76;

const ShoeTile = ({ shoe, selected, onPress, label }) => (
  <ImageTile
    source={shoe.imageUrl ? { uri: getImageUrl(shoe.imageUrl, 300) } : null}
    placeholder={shoe.name}
    label={label}
    selected={selected}
    onPress={onPress}
    resizeMode="contain"
    style={styles.tile}
  />
);

const ShoeRow = ({ children }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
    {children}
  </ScrollView>
);

export const OutfitShoes = ({ match, onChanged }) => {
  const outfitShoes = useOutfitShoes({ match, onChanged });
  const [adding, setAdding] = useState(false);

  if (outfitShoes.loading || !outfitShoes.hasFootwear) return null;

  return (
    <View style={styles.section}>
      <SectionTitle
        title="Shoes"
        field
        right={
          outfitShoes.others.length ? (
            <TextAction
              label={adding ? "Done" : "Add"}
              onPress={() => setAdding(!adding)}
              disabled={outfitShoes.saving}
            />
          ) : null
        }
      />

      {outfitShoes.shoes.length ? (
        <ShoeRow>
          {outfitShoes.shoes.map((shoe) => (
            <ShoeTile
              key={shoe._id}
              shoe={shoe}
              selected
              label={`Remove ${shoe.name || "shoes"}`}
              onPress={() => outfitShoes.remove(shoe)}
            />
          ))}
        </ShoeRow>
      ) : (
        <EmptyState title="No shoes saved with this outfit yet" compact />
      )}

      {adding ? (
        <ShoeRow>
          {outfitShoes.others.map((shoe) => (
            <ShoeTile
              key={shoe._id}
              shoe={shoe}
              label={`Add ${shoe.name || "shoes"}`}
              onPress={() => outfitShoes.add(shoe)}
            />
          ))}
        </ShoeRow>
      ) : null}

      <Message text={outfitShoes.error} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: space.sm,
  },
  row: {
    gap: space.xs,
  },
  tile: {
    width: TILE_SIZE,
    padding: space.xs,
    borderRadius: radii.tile,
  },
});
