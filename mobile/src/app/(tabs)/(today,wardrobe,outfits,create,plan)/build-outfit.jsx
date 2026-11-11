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
// The Shoes chip (after the clothing ones) picks shoes for the outfit,
// shown with it - the first picked - and saved as the shoes Today shows
// first with it.
//
// ?planDate=YYYY-MM-DD (the Plan tab's Build my own): building the outfit
// for that day - its weather on top, one pair of shoes only, and saving
// plans it (and favourites it), then goes back to the day.
// Logic: useCreateMatch (shared with the web's Build Outfits page).

import { useEffect, useRef, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
} from "@core/filters/filterDefaults.js";
import { SHOES_CATEGORY, useCreateMatch } from "@core/hooks/useCreateMatch.js";
import { useDayWeather } from "@core/hooks/useDayWeather.js";
import { getTodayDate } from "@core/utils/dates.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { colors } from "../../../theme/tokens";
import { iconSizes, ink, loaderSizes, radii, space } from "../../../theme/soft";
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
import { DayWeatherCard } from "../../../components/plan/DayWeatherCard";
import { markPlanChanged } from "../../../components/plan/planChanged";
import { useLocation } from "../../../platform/useLocation";

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

// The day's weather, for building around it (planning only).
const PlanWeather = ({ planDate }) => {
  const location = useLocation();
  const dayWeather = useDayWeather({
    date: planDate,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  return <DayWeatherCard dayWeather={dayWeather} />;
};

export default function BuildOutfitScreen() {
  const { planDate } = useLocalSearchParams();
  const builder = useCreateMatch({ planDate: planDate || null });
  // The header is transparent: start below it.
  const headerSpace = useHeaderSpace();
  // The clothes panel's position and height, for the outfit to follow.
  const panelOffset = useRef(new Animated.Value(0)).current;
  const [panelHeight, setPanelHeight] = useState(0);

  const { result, selectedItems, selectedShoes } = builder;
  // The shoe shown with the outfit: the first picked.
  const shownShoe = selectedShoes[0] ?? null;

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

    if (result.ok && planDate) {
      markPlanChanged({ today: planDate === getTodayDate() });
    }

    const okButtons = planDate
      ? [{ text: "OK", onPress: () => router.back() }]
      : [
          { text: "Build another", onPress: builder.clearResult },
          { text: "See outfits", onPress: () => router.back() },
        ];

    showDialog(
      result.title,
      result.message,
      result.ok ? okButtons : [{ text: "OK", onPress: builder.clearResult }]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const empty = selectedItems.length === 0;
  // How much of the outfit's space the open clothes panel covers (the
  // space is laid out to the panel's peek), so the hanger sits above it.
  const hangerBottom = Math.max(0, panelHeight - PULL_UP_PEEK - space.sm);

  // The outfit shrinks and moves up as the panel opens.
  const follow = useOutfitFollowsPanel({
    match: outfit,
    footwear: shownShoe,
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
          title: planDate ? "Plan outfit" : "Build outfit",
          headerRight: () => (
            <SaveButton
              onPress={builder.submit}
              empty={empty}
              saving={builder.submitting}
            />
          ),
        }}
      />

      {planDate ? (
        <View style={styles.weather}>
          <PlanWeather planDate={planDate} />
        </View>
      ) : null}

      {/* The outfit being built - most of the page. */}
      <View style={[cardBox, styles.outfitArea]}>
        <View style={styles.fill} onLayout={follow.onLayout}>
          <Animated.View style={[styles.fill, follow.style]}>
            <OutfitImages
              match={outfit}
              footwear={shownShoe}
              fit
              // The same copy as the clothes row below, so a picked item is
              // usually already loaded; the bubble covers the rest.
              imageSize={300}
              showLoading
              imageStyle={styles.photo}
              onItemPress={(item) =>
                builder.toggleItem(categoryOf(item) ?? SHOES_CATEGORY, item)
              }
              itemLabel={(item) => `Remove ${item.name || "item"}`}
            />
          </Animated.View>
          {/* Nothing picked yet: a small hanger in the middle of the space
              left above the open clothes panel. */}
          {empty && !shownShoe ? (
            <View
              style={[styles.emptyOutfit, { bottom: hangerBottom }]}
              pointerEvents="none"
            >
              <MaterialCommunityIcons
                name="hanger"
                size={iconSizes.medium}
                color={ink.muted}
                accessibilityLabel="No items picked yet"
              />
            </View>
          ) : null}
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
              {builder.hasFootwear ? (
                <Chip
                  label={planDate ? "Shoes (one pair)" : "Shoes"}
                  selected={builder.category === SHOES_CATEGORY}
                  onPress={() => builder.chooseCategory(SHOES_CATEGORY)}
                />
              ) : null}
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
              placeholder={builder.category === SHOES_CATEGORY ? "Search shoes…" : "Search clothing…"}
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
  weather: {
    marginHorizontal: space.gutter,
    marginTop: space.xs,
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
  emptyOutfit: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
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
