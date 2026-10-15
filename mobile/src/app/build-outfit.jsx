// Build an outfit by hand: tick clothes from each category, then submit.
// Logic: useCreateMatch (shared with the web's Build Outfits page).

import { useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
} from "@core/filters/filterDefaults.js";
import { useCreateMatch } from "@core/hooks/useCreateMatch.js";
import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import {
  Button,
  Chip,
  ChipRow,
  EmptyState,
  ImageTile,
  TextField,
} from "../components/ui";
import { markOutfitsChanged } from "../components/outfits/outfitsChanged";

const COLUMNS = 3;

export default function BuildOutfitScreen() {
  const builder = useCreateMatch();

  // Three tiles to a row, filling the width between the side padding.
  const { width } = useWindowDimensions();
  const cellWidth =
    (width - spacing.xl * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS;
  const { result, selectedItems } = builder;

  // Show the outcome of a submit once.
  useEffect(() => {
    if (!result) return;

    if (result.ok) {
      markOutfitsChanged();
    }

    Alert.alert(
      result.title,
      result.message,
      result.ok
        ? [
            { text: "Build another", onPress: builder.clearResult },
            { text: "See outfits", onPress: () => router.back() },
          ]
        : [{ text: "OK", onPress: builder.clearResult }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <Stack.Screen options={{ title: "Build an outfit" }} />

      <View style={styles.header}>
        <Text style={styles.label}>
          Selected outfit ({selectedItems.length})
        </Text>

        {selectedItems.length === 0 ? (
          <Text style={styles.hint}>
            Tick clothes below to build an outfit.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selected}>
              {selectedItems.map(({ category, item }) => (
                <View key={item._id} style={styles.selectedItem}>
                  <Image
                    source={item.imageUrl ? getImageUrl(item.imageUrl, 200) : null}
                    style={styles.selectedImage}
                    contentFit="contain"
                  />
                  <Pressable
                    onPress={() => builder.toggleItem(category, item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.name || "item"}`}
                    hitSlop={8}
                    style={styles.remove}
                  >
                    <Feather name="x" size={12} color={colors.inverse} />
                  </Pressable>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <ChipRow scroll>
          {ITEM_CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={ITEM_CATEGORY_LABELS[category]}
              selected={builder.category === category}
              onPress={() => builder.chooseCategory(category)}
            />
          ))}
        </ChipRow>

        <TextField
          placeholder="Search clothing..."
          value={builder.searchTerm}
          onChangeText={builder.setSearchTerm}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={builder.categoryItems}
        keyExtractor={(item) => item._id}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={{ width: cellWidth }}>
            <ImageTile
              source={
                item.imageUrl ? { uri: getImageUrl(item.imageUrl, 300) } : null
              }
              placeholder={item.name}
              label={item.name}
              selected={builder.isSelected(builder.category, item)}
              onPress={() => builder.toggleItem(builder.category, item)}
              resizeMode="contain"
            />
          </View>
        )}
        ListEmptyComponent={
          builder.loading ? (
            <ActivityIndicator color={colors.main} style={styles.spinner} />
          ) : (
            <EmptyState title="No items found." />
          )
        }
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.footer}>
        <Button
          label="Submit outfit"
          onPress={builder.submit}
          loading={builder.submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  hint: {
    fontSize: fontSizes.small,
    color: colors.secondary,
  },
  selected: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  selectedItem: {
    width: 64,
    height: 64,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: radius.md,
    backgroundColor: colors.imageBackground,
  },
  remove: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  row: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
