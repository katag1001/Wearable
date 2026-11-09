// "Filter by item" inside the filter sheet: for each category, step
// through the user's items one at a time and tap one to show only outfits
// with it (tap again to clear). The stepping is useFilterPanel's.

import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
} from "@core/filters/filterDefaults.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { colors } from "../../theme/tokens";
import { radii, space, type } from "../../theme/soft";
import { IconButton, PressableScale, SelectionHalo } from "../soft";
import { EmptyState, SectionTitle, SelectedTick, TextField } from "../ui";

const Arrow = ({ name, label, onPress, disabled }) => (
  <IconButton
    icon={name}
    label={label}
    tone="quiet"
    onPress={onPress}
    disabled={disabled}
    hitSlop={8}
    style={styles.arrow}
  />
);

export const ItemFilterView = ({ panel }) => (
  <>
    <TextField
      placeholder="Search clothing items…"
      value={panel.itemSearchTerm}
      onChangeText={panel.searchItems}
    />

    {ITEM_CATEGORIES.map((category) => {
      const item = panel.getCurrentCategoryItem(category);
      const label = ITEM_CATEGORY_LABELS[category];
      const selected = !!item && panel.draft.items?.[category] === item._id;

      return (
        <View key={category} style={styles.category}>
          <SectionTitle title={label} field />

          <View style={styles.carousel}>
            <Arrow
              name="chevron-left"
              label={`Previous ${label}`}
              onPress={() => panel.stepCategory(category, -1)}
              disabled={!item}
            />

            {item ? (
              <PressableScale
                onPress={() => panel.toggleCategoryItem(category, item)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={styles.item}
              >

                <Image
                  source={item.imageUrl ? getImageUrl(item.imageUrl, 200) : null}
                  style={styles.image}
                  contentFit="contain"
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {selected ? (
                  <>
                    <SelectionHalo radius={radii.tile} />
                    <SelectedTick />
                  </>
                ) : null}
              </PressableScale>
            ) : (
              <EmptyState title="No items found" compact style={styles.item} />
            )}

            <Arrow
              name="chevron-right"
              label={`Next ${label}`}
              onPress={() => panel.stepCategory(category, 1)}
              disabled={!item}
            />
          </View>
        </View>
      );
    })}
  </>
);

const styles = StyleSheet.create({
  category: {
    gap: space.xs,
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  arrow: {
    padding: space.xxs,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: space.xxs,
    padding: space.xs,
    borderRadius: radii.tile,
    borderCurve: "continuous",
    backgroundColor: colors.itemBackground,
  },
  image: {
    width: 96,
    height: 96,
  },
  name: type.caption,
});
