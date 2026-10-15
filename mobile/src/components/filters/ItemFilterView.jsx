// "Filter by item" inside the filter sheet: for each category, step
// through the user's items one at a time and tap one to show only outfits
// with it (tap again to clear). The stepping is useFilterPanel's.

import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
} from "@core/filters/filterDefaults.js";
import {
  colors,
  fontSizes,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { SectionTitle, TextField } from "../ui";

const Arrow = ({ name, label, onPress, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={label}
    hitSlop={8}
    style={[styles.arrow, disabled && styles.disabled]}
  >
    <Feather name={name} size={22} color={colors.main} />
  </Pressable>
);

export const ItemFilterView = ({ panel }) => (
  <>
    <TextField
      placeholder="Search clothing items..."
      value={panel.itemSearchTerm}
      onChangeText={panel.searchItems}
    />

    {ITEM_CATEGORIES.map((category) => {
      const item = panel.getCurrentCategoryItem(category);
      const label = ITEM_CATEGORY_LABELS[category];
      const selected = !!item && panel.draft.items?.[category] === item._id;

      return (
        <View key={category} style={styles.category}>
          <SectionTitle title={label} />

          <View style={styles.carousel}>
            <Arrow
              name="chevron-left"
              label={`Previous ${label}`}
              onPress={() => panel.stepCategory(category, -1)}
              disabled={!item}
            />

            {item ? (
              <Pressable
                onPress={() => panel.toggleCategoryItem(category, item)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.item, selected && styles.selected]}
              >
                <Image
                  source={item.imageUrl ? getImageUrl(item.imageUrl, 200) : null}
                  style={styles.image}
                  contentFit="contain"
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.item, styles.empty]}>No items found.</Text>
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
    gap: spacing.sm,
  },
  carousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  arrow: {
    padding: spacing.xs,
  },
  disabled: {
    opacity: 0.3,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: colors.imageBackground,
  },
  selected: {
    borderColor: colors.main,
  },
  image: {
    width: 96,
    height: 96,
  },
  name: {
    fontSize: fontSizes.small,
    color: colors.main,
  },
  empty: {
    textAlign: "center",
    paddingVertical: spacing.xl,
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
});
