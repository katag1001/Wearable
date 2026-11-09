// Build an outfit by hand. Most of the page is the outfit being built,
// laid out as it's worn (tops over bottoms, as on Today), straight on the
// page; tap an item there to take it out. The + to save it is a plain
// icon in the header, as Wardrobe's and Outfits' + are, across from the
// back arrow and the title.
// Underneath, on a panel like the top of a card that's popped up (drag it
// down to see the outfit full screen - PullUpPanel; the outfit scales up
// and down with it, without re-laying out, so nothing flashes): the
// category chips (with the chosen category's subtypes on a row below, as
// in the wardrobe), a search, and those clothes in one row that scrolls
// sideways and loops round - tap to add or remove.
// Logic: useCreateMatch (shared with the web's Build Outfits page).

import { useEffect, useRef, useState } from "react";
import { router, Stack } from "expo-router";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
} from "@core/filters/filterDefaults.js";
import { useCreateMatch } from "@core/hooks/useCreateMatch.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { colors } from "../../../theme/tokens";
import { iconSizes, loaderSizes, radii, space } from "../../../theme/soft";
import {
  Chip,
  ChipRow,
  EmptyState,
  ImageTile,
  TextField,
} from "../../../components/ui";
import { cardBox } from "../../../components/ui/cardBox";
import { markOutfitsChanged } from "../../../components/outfits/outfitsChanged";
import {
  Atmosphere,
  BubbleLoader,
  IconButton,
  LoopingRow,
  PULL_UP_PEEK,
  PullUpPanel,
  useHeaderSpace,
} from "../../../components/soft";
import { OutfitImages } from "../../../components/today/OutfitImages";
import {
  useOutfitFollowsPanel,
} from "../../../components/today/useOutfitFollowsPanel";
import { showDialog } from "../../../components/soft/Dialog";

// The clothes row's tiles.
const TILE_SIZE = 96;
const TILE_GAP = space.xs;

// The header's save button: a plain +, faded until the outfit has an
// item; the breathing bubble while it saves.
const SaveButton = ({ onPress, empty, saving }) =>
  saving ? (
    <BubbleLoader size={iconSizes.regular} fill={false} />
  ) : (
    <IconButton icon="plus" label="Save this outfit" onPress={onPress} disabled={empty} />
  );

export default function BuildOutfitScreen() {
  const builder = useCreateMatch();
  // The header is transparent: start below it.
  const headerSpace = useHeaderSpace();
  // The clothes panel's position and height, for the outfit to follow.
  const panelOffset = useRef(new Animated.Value(0)).current;
  const [panelHeight, setPanelHeight] = useState(0);

  const { result, selectedItems } = builder;

  // The outfit as OutfitImages lays it out; each item keeps its category
  // (which is its role) for removing it again.
  const outfit = {
    clothes: selectedItems.map(({ category, item }) => ({
      ...item,
      type: item.type || category,
    })),
  };
  const categoryOf = (item) =>
    selectedItems.find((selected) => selected.item._id === item._id)?.category;

  // Show the outcome of a submit once.
  useEffect(() => {
    if (!result) return;

    if (result.ok) {
      markOutfitsChanged();
    }

    showDialog(
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

  const empty = selectedItems.length === 0;

  // The outfit shrinks and moves up as the panel opens.
  const follow = useOutfitFollowsPanel({
    match: outfit,
    panelOffset,
    panelHeight,
  });

  return (
    <SafeAreaView
      style={[styles.screen, { paddingTop: headerSpace }]}
      edges={["bottom"]}
    >
      <Atmosphere />

      <Stack.Screen
        options={{
          title: "Build outfit",
          headerRight: () => (
            <SaveButton
              onPress={builder.submit}
              empty={empty}
              saving={builder.submitting}
            />
          ),
        }}
      />

      {/* The outfit being built - most of the page. */}
      <View style={[cardBox, styles.outfitArea]}>
        <View style={styles.fill} onLayout={follow.onLayout}>
          <Animated.View style={[styles.fill, follow.style]}>
            <OutfitImages
              match={outfit}
              fit
              // The same copy as the clothes row below, so a picked item is
              // usually already loaded; the bubble covers the rest.
              imageSize={300}
              showLoading
              imageStyle={styles.photo}
              onItemPress={(item) => builder.toggleItem(categoryOf(item), item)}
              itemLabel={(item) => `Remove ${item.name || "item"}`}
            />
          </Animated.View>
        </View>
      </View>

      {/* Drag its top down to see the outfit full screen. */}
      <PullUpPanel offset={panelOffset} onHeight={setPanelHeight}>
        <View style={styles.picker}>
          <View style={styles.controls}>
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

            {builder.subtypes.length > 0 && (
              <ChipRow scroll>
                {builder.subtypes.map((subtype) => (
                  <Chip
                    key={subtype}
                    label={subtype}
                    selected={builder.selectedSubtypes.includes(subtype)}
                    onPress={() => builder.toggleSubtype(subtype)}
                  />
                ))}
              </ChipRow>
            )}

            <TextField
              placeholder="Search clothing…"
              value={builder.searchTerm}
              onChangeText={builder.setSearchTerm}
              autoCapitalize="none"
            />
          </View>

          {builder.loading ? (
            <BubbleLoader size={loaderSizes.medium} fill={false} style={styles.rowStatus} />
          ) : builder.categoryItems.length === 0 ? (
            <EmptyState title="No items found" compact style={styles.rowStatus} />
          ) : (
            <LoopingRow
              // Starts again on the first item when what's shown changes.
              key={`${builder.category}-${builder.selectedSubtypes.join(",")}`}
              items={builder.categoryItems}
              itemWidth={TILE_SIZE}
              gap={TILE_GAP}
              contentPadding={space.gutter}
              keyExtractor={(item) => item._id}
              renderItem={(item) => (
                <ImageTile
                  source={
                    item.imageUrl ? { uri: getImageUrl(item.imageUrl, 300) } : null
                  }
                  placeholder={item.name}
                  label={item.name}
                  selected={builder.isSelected(builder.category, item)}
                  onPress={() => builder.toggleItem(builder.category, item)}
                  resizeMode="contain"
                  style={styles.tile}
                />
              )}
            />
          )}
        </View>
      </PullUpPanel>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  // No box: the outfit sits straight on the page. It's always laid out
  // to the panel's tucked-away top (just the peek below it).
  fill: {
    flex: 1,
  },
  outfitArea: {
    marginBottom: PULL_UP_PEEK + space.sm,
    backgroundColor: "transparent",
    boxShadow: "none",
    paddingTop: space.md,
    flex: 1,
    marginHorizontal: space.gutter,
    marginTop: space.xs,
  },
  photo: {
    backgroundColor: "transparent",
  },
  // Inside the pull-up panel (which draws the card itself).
  picker: {
    gap: space.sm,
    paddingBottom: space.sm,
  },
  controls: {
    gap: space.sm,
    paddingHorizontal: space.gutter,
  },
  // The photos are trimmed to the item: pad them so they sit smaller in
  // the tile, with room round them.
  tile: {
    width: TILE_SIZE,
    padding: space.sm + 2,
    borderRadius: radii.tile,
  },
  rowStatus: {
    height: TILE_SIZE,
    justifyContent: "center",
  },
});
