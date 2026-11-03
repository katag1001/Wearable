// One outfit, full screen: its photos (with a heart to favourite it and a
// broken heart to mark two of its items as a mismatch) filling the page,
// and its star rating, temperature range and tags to edit on a pull-up
// panel (as on Build outfit): it opens part way up, drags down to see the
// outfit on its own, or up to see every field. The outfit shrinks and
// moves up as the panel rises to part way (useOutfitFollowsPanel).
// Changes save themselves as they're made (useAutoSaveOutfit) - asking
// first when a 1-2 star rating would delete the outfit. "Wear today" sits
// on the stars' line. Saving 1-2 stars
// can delete it (server/services/matchRatingService.js). Opened from the Outfits
// list, or by tapping the outfit on Today (?from=today). ?mismatch=1 opens
// straight on the broken heart's item picker (an outfit card's broken
// heart), and closing it goes back rather than to the outfit.
//
// The outfit is handed over by the opener (outfitHandoff); every change is
// handed back (markOutfitEdited) so Today can show it, and the Outfits
// list refreshes (markOutfitsChanged). From Today, wearing and deleting
// stay on Today's own buttons (they wear the shoes too), so only Save
// shows here. Logic: useMatchCard (shared with the web's expanded card).

import { useEffect, useRef, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { deleteMatches } from "@core/api/matches.js";
import { getErrorMessage } from "@core/api/errors.js";
import { useMatchCard } from "@core/hooks/useMatchCard.js";
import { ratingDeletesOutfit } from "@core/matches/rating.js";

import {
  colors,
  fontWeights,
  shadows,
  spacing,
} from "../../../theme/tokens";
import { space } from "../../../theme/soft";
import {
  Atmosphere,
  PULL_UP_PEEK,
  PullUpPanel,
  useHeaderSpace,
} from "../../../components/soft";
import { OutfitDetails } from "../../../components/outfits/OutfitDetails";
import { OutfitMismatch } from "../../../components/outfits/OutfitMismatch";
import {
  useAutoSaveOutfit,
} from "../../../components/outfits/useAutoSaveOutfit";
import {
  markOutfitEdited,
  markOutfitsRemoved,
  takeOutfit,
} from "../../../components/outfits/outfitHandoff";
import { markOutfitsChanged } from "../../../components/outfits/outfitsChanged";
import { OutfitImages } from "../../../components/today/OutfitImages";
import {
  useOutfitFollowsPanel,
} from "../../../components/today/useOutfitFollowsPanel";
import { Button, FavouriteHeart, Message } from "../../../components/ui";

// How much of the page the details panel covers part way up. Fully open,
// it reaches the header.
const PART_WAY = 0.42;

// "Wear today" with the heart for it on its right, like Today's heart.
// Filled and done ("Worn today") once it's worn today.
const MarkWorn = ({ worn, loading, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={worn || loading}
    accessibilityRole="button"
    accessibilityLabel={worn ? "Worn today" : "Wear today"}
    accessibilityState={{ disabled: worn, busy: loading }}
    hitSlop={8}
    style={({ pressed }) => [styles.markWorn, pressed && styles.pressed]}
  >
    <Text style={styles.markWornLabel}>{worn ? "Worn today" : "Wear today"}</Text>
    <View style={[styles.wornHeart, worn && styles.wornHeartOn]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.secondary} />
      ) : (
        <MaterialCommunityIcons
          name={worn ? "heart" : "heart-outline"}
          size={20}
          color={worn ? colors.inverse : colors.secondary}
        />
      )}
    </View>
  </Pressable>
);

export default function OutfitScreen() {
  const { from, mismatch } = useLocalSearchParams();
  const openedForMismatch = mismatch === "1";
  const fromToday = from === "today";

  const [handedOver] = useState(() => takeOutfit());
  const [match, setMatch] = useState(handedOver?.match ?? null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // The broken heart's item picker, in place of the screen while open.
  const [mismatching, setMismatching] = useState(openedForMismatch);

  // The page below the header, the details panel's position and height,
  // and the outfit following it.
  const headerSpace = useHeaderSpace();
  const [pageHeight, setPageHeight] = useState(0);
  const panelOffset = useRef(new Animated.Value(0)).current;
  const [panelHeight, setPanelHeight] = useState(0);
  const partWay = Math.round(pageHeight * PART_WAY);
  const follow = useOutfitFollowsPanel({
    match: match ?? {},
    footwear: handedOver?.footwear,
    panelOffset,
    panelHeight,
    openVisible: partWay,
  });

  // This screen's copy; the changes are handed back to Today too.
  const changeMatch = (fields) => {
    setMatch((prev) => ({ ...prev, ...fields }));
    markOutfitEdited(match._id, fields);
  };

  const card = useMatchCard({
    match: match ?? {},
    onChanged: markOutfitsChanged,
    onFavouriteToggle: (_, fields) => {
      changeMatch(fields);
      markOutfitsChanged();
    },
    onError: setError,
  });

  useAutoSaveOutfit({
    card,
    onSaved: changeMatch,
    onDeleted: ({ leaving }) => {
      markOutfitsRemoved([match._id]);
      markOutfitsChanged();
      if (!leaving) router.back();
    },
  });

  // Opened without an outfit (e.g. after a reload) - nothing to show.
  useEffect(() => {
    if (!match) {
      router.back();
      return;
    }

    // From Today, with any stars picked there.
    card.startEditing(
      handedOver.rating != null ? { rating: handedOver.rating } : undefined
    );
    // Once, for the outfit this screen opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!match) return null;

  // 1-2 stars deletes most outfits: ask before that's saved.
  const rate = (rating) => {
    if (!ratingDeletesOutfit(match, rating)) {
      card.setRating(rating);
      return;
    }

    Alert.alert(
      "Remove this outfit?",
      "Rating it 1 or 2 stars removes it from your outfits.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => card.setRating(rating),
        },
      ]
    );
  };

  const handleMarkWorn = async () => {
    if (await card.markWorn()) {
      changeMatch({ lastWornDate: new Date().toISOString() });
    }
  };

  const deleteOutfit = async () => {
    setDeleting(true);

    try {
      await deleteMatches([match._id]);
      markOutfitsChanged();
      router.back();
    } catch (err) {
      setDeleting(false);
      setError(getErrorMessage(err, "Failed to delete outfit"));
    }
  };

  // Saved: the outfits with the pair are gone (this one too, unless it's a
  // favourite or user-built) - Today and the Outfits list are told.
  const handleMismatched = (deletedMatchIds) => {
    markOutfitsRemoved(deletedMatchIds);
    markOutfitsChanged();
    router.back();
  };

  const confirmDelete = () =>
    Alert.alert("Delete outfit", "Are you sure you want to delete this outfit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteOutfit },
    ]);

  if (mismatching) {
    return (
      <>
        <Stack.Screen options={{ title: "Mismatch" }} />
        <OutfitMismatch
          match={match}
          onClose={() =>
            openedForMismatch ? router.back() : setMismatching(false)
          }
          onMismatched={handleMismatched}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Outfit" }} />
      <View
        style={[styles.screen, { paddingTop: headerSpace }]}
        onLayout={(event) =>
          setPageHeight(event.nativeEvent.layout.height - headerSpace)
        }
      >
        <Atmosphere />

        {/* The outfit, laid out to the panel's tucked-away top. */}
        <View style={styles.outfitArea}>
          <View style={styles.fill} onLayout={follow.onLayout}>
            <Animated.View style={[styles.fill, follow.style]}>
              <OutfitImages match={match} footwear={handedOver.footwear} fit />
            </Animated.View>
          </View>

          <View style={styles.cornerIcons}>
            <FavouriteHeart
              favourite={match.favourite}
              onPress={card.toggleFavourite}
              size={24}
              style={styles.cornerIcon}
            />
            <Pressable
              onPress={() => setMismatching(true)}
              accessibilityRole="button"
              accessibilityLabel="Mismatch"
              hitSlop={10}
              style={styles.cornerIcon}
            >
              <MaterialCommunityIcons
                name="heart-broken-outline"
                size={24}
                color={colors.muted}
              />
            </Pressable>
          </View>
        </View>

        {pageHeight > 0 && (
          <PullUpPanel
            stops={[PULL_UP_PEEK, partWay, "full"]}
            initialStop={1}
            offset={panelOffset}
            onHeight={setPanelHeight}
            style={{ height: pageHeight }}
            // Part way up, dragging the details moves the panel, so it
            // opens fully from anywhere on it; fully open, they scroll.
            dragContent
          >
            <ScrollView
              style={styles.fill}
              contentContainerStyle={styles.details}
            >
              <OutfitDetails
                card={{ ...card, setRating: rate }}
                ratingAside={
                  // From Today, wearing stays on Today's own heart.
                  fromToday ? null : (
                    <MarkWorn
                      worn={card.wornToday}
                      loading={card.markingWorn}
                      onPress={handleMarkWorn}
                    />
                  )
                }
              />

              <Message text={error} />

              {!fromToday && (
                <Button
                  label="Delete outfit"
                  variant="text"
                  onPress={confirmDelete}
                  loading={deleting}
                />
              )}
            </ScrollView>
          </PullUpPanel>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  fill: {
    flex: 1,
  },
  // Always laid out to the panel's tucked-away top (just the peek below).
  outfitArea: {
    flex: 1,
    marginHorizontal: space.gutter,
    marginTop: spacing.sm,
    marginBottom: PULL_UP_PEEK + spacing.md,
  },
  details: {
    paddingHorizontal: space.gutter,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  // The heart, with the broken heart straight underneath it.
  cornerIcons: {
    position: "absolute",
    top: 0,
    right: 0,
    alignItems: "center",
    gap: spacing.sm,
  },
  // Both the same size box, so they line up one above the other.
  cornerIcon: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.5,
  },
  markWorn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  // A small white circle like Today's hearts; soft lavender once worn.
  wornHeart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBackground,
    boxShadow: shadows.soft,
  },
  wornHeartOn: {
    backgroundColor: colors.selected,
  },
  markWornLabel: {
    fontFamily: fontWeights.medium,
    fontSize: 14,
    color: colors.secondary,
  },
});
