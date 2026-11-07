// Today's outfit: the sorted outfits one at a time, each with its shoes,
// swiped like cards (next rejects the one being left). Tapping the outfit
// opens it full screen to change its details (and rate it - no stars on
// this page for now). The heart wears the outfit and its shoes today
// (playing onCelebrate), the shoe opens Change shoes (onChangeShoes), the
// broken heart opens "not this outfit" (onNotThisOutfit - too hot, too
// cold or a mismatch).
//
// `worn`: the outfit worn today is on show, exactly where it was - the
// page doesn't change - with swiping off (no arrows) and Change outfit in
// place of the hearts (back to choosing).
//
// With another tag picked for today (useToday's pickTag) only its outfits
// are on show, without wrapping round: past the last one is a note that
// there are no more, and with none at all the note stands in for them.
//
// The tights and trend notes float over the photos in bubbles
// (NoteBubble) the user can drag about; each starts in its own spot and is
// back there on the next outfit. While one is dragged an X shows at the
// bottom (DismissTarget) - dropped on it, the bubble goes for this outfit.
// Logic: useTodayLook.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { trendNoteText } from "@core/today/trendNote.js";

import { handOverOutfit } from "../outfits/outfitHandoff";
import { space, type } from "../../theme/soft";
import { ACTION_BUTTON_SIZE, ActionButton } from "./ActionButton";
import { DismissTarget } from "./DismissTarget";
import { NOTE_BUBBLE_SIZE, NoteBubble } from "./NoteBubble";
import { OutfitImages } from "./OutfitImages";
import { SwipeDeck } from "./SwipeDeck";

// The two hearts stacked in the bottom left corner (styles.actions).
const HEARTS_HEIGHT = ACTION_BUTTON_SIZE * 2 + space.sm * 2;

// Where each bubble starts, in order: top right, then across from it in
// the bottom left (just above the hearts), then top left. Never on top of
// each other - on a short screen the bottom left one goes no higher than
// under the top left one.
const bubbleStarts = ({ width, height }) => {
  const left = 0;
  const right = width - NOTE_BUBBLE_SIZE;
  const aboveHearts = height - HEARTS_HEIGHT - space.xs - NOTE_BUBBLE_SIZE;

  return [
    { x: right, y: 0 },
    { x: left, y: Math.max(NOTE_BUBBLE_SIZE + space.xs, aboveHearts) },
    { x: left, y: 0 },
  ];
};

export const OutfitPicker = ({
  today,
  worn = false,
  onCelebrate,
  onChangeShoes,
  onNotThisOutfit,
}) => {
  const { filteredOutfits } = today;
  const outfit = worn ? today.wornOutfit : today.selectedOutfit;
  const shoe = worn ? today.wornShoe : today.selectedShoe;
  // The picker's size, for where the bubbles start and how far they go.
  const [bounds, setBounds] = useState(null);
  // A bubble being dragged ({ dragging, overX }), and the bubbles dropped
  // on the X (by key - each outfit's own).
  const [drag, setDrag] = useState({ dragging: false, overX: false });
  const [dismissed, setDismissed] = useState(() => new Set());

  const openOutfit = () => {
    // With the stars picked here, which the outfit screen saves.
    handOverOutfit(outfit.matchId, shoe, worn ? null : today.selectedRating);
    router.push({ pathname: "/outfit", params: { from: "today" } });
  };

  const wear = async () => {
    if (await today.markAsWornToday()) {
      onCelebrate();
    }
  };

  // Past the picked tag's last outfit, or it has none.
  if (!outfit && !worn && today.pickedTag) {
    const tagWords = today.pickedTag.toLowerCase();

    if (!filteredOutfits.length) {
      return (
        <Text style={styles.empty}>
          No {tagWords} outfits that fit today's weather
        </Text>
      );
    }

    // Still a card, so swiping back reaches the last outfit.
    return (
      <View style={styles.deck}>
        <SwipeDeck
          enabled={today.canMove}
          onNext={today.goNext}
          onPrev={today.goPrev}
          noun="outfit"
          fill
        >
          <View style={styles.endCard}>
            <Text style={styles.empty}>
              No more {tagWords} outfits that fit today's weather
            </Text>
          </View>
        </SwipeDeck>
      </View>
    );
  }

  if (!outfit) {
    return <Text style={styles.empty}>No outfits saved for today.</Text>;
  }

  const trendNote = trendNoteText(outfit.trendNote, outfit.matchId?._id ?? outfit._id);
  const shoeTrendNote = today.shoeTrendNote(shoe);
  const outfitKey = outfit.matchId?._id ?? outfit._id;

  // Tights only on today's list thanks to its tights range; trends (the
  // outfit, or the shoe shown) for users who care a lot about trends.
  const notes = [
    outfit.withTights ? { key: "tights", text: "Remember some tights today!" } : null,
    trendNote ? { key: "trend", text: trendNote } : null,
    shoeTrendNote ? { key: `shoe-${shoe?._id}`, text: shoeTrendNote } : null,
  ]
    .filter(Boolean)
    // The spot is kept when another bubble goes.
    .map((note, slot) => ({ ...note, key: `${outfitKey}-${note.key}`, slot }))
    .filter((note) => !dismissed.has(note.key));

  const dismiss = (key) => setDismissed((last) => new Set(last).add(key));

  const onLayout = ({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout;
    setBounds((last) =>
      last?.width === width && last?.height === height ? last : { width, height }
    );
  };

  return (
    <View style={styles.picker} onLayout={onLayout}>
      <View style={styles.deck}>
        <SwipeDeck
          enabled={!worn && today.canMove}
          cardKey={outfitKey}
          onNext={today.goNext}
          onPrev={today.goPrev}
          noun="outfit"
          fill
        >
          {/* A tap (not a swipe) opens the outfit to change its details. */}
          <Pressable
            onPress={openOutfit}
            accessibilityRole="button"
            accessibilityLabel="Outfit"
            accessibilityHint="Opens the outfit"
            style={styles.card}
          >
            {/* Shrinks to fit, so the page never scrolls. */}
            <OutfitImages
              match={outfit.matchId}
              footwear={shoe}
              fit
              imageStyle={styles.photo}
            />
          </Pressable>
        </SwipeDeck>
      </View>

      {/* Over the bottom of the photos: the two hearts stacked in the
          bottom left corner (Change outfit once it's worn), the shoe in the
          bottom right. Touches between them still reach the outfit
          (box-none). No stars here for now. */}
      <View style={styles.actions} pointerEvents="box-none">
        {worn ? (
          // Just the circle: the swap icon says it.
          <ActionButton
            icon="swap-horizontal"
            iconSet={MaterialCommunityIcons}
            label="Change outfit"
            onPress={today.showOutfitPicker}
          />
        ) : (
          <View style={styles.hearts}>
            <ActionButton
              icon="heart-broken-outline"
              iconSet={MaterialCommunityIcons}
              label="Not this outfit"
              onPress={onNotThisOutfit}
            />
            <ActionButton
              icon="heart-outline"
              iconSet={MaterialCommunityIcons}
              label="Wear this outfit today"
              onPress={wear}
              loading={today.wearing}
            />
          </View>
        )}

        {today.footwear.hasFootwear ? (
          <ActionButton
            icon="shoe-sneaker"
            iconSet={MaterialCommunityIcons}
            label="Change shoes"
            onPress={onChangeShoes}
            small
          />
        ) : null}
      </View>

      {/* Over everything, but only the bubbles take touches. */}
      {bounds && notes.length ? (
        <View style={styles.bubbles} pointerEvents="box-none">
          {drag.dragging ? <DismissTarget hot={drag.overX} /> : null}
          {notes.map((note) => (
            <NoteBubble
              key={note.key}
              text={note.text}
              start={bubbleStarts(bounds)[note.slot]}
              bounds={bounds}
              variant={note.slot}
              onDragChange={setDrag}
              onDismiss={() => dismiss(note.key)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    flex: 1,
    gap: space.sm,
  },
  deck: {
    flex: 1,
    justifyContent: "center",
  },
  // No box: the outfit sits straight on the page's white middle.
  card: {
    flex: 1,
  },
  endCard: {
    flex: 1,
    justifyContent: "center",
  },
  // The photos have their backgrounds removed; no tile behind them.
  photo: {
    backgroundColor: "transparent",
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: space.sm,
    // Above the swipe deck's side arrows (zIndex / elevation 1), which run
    // the full height of the outfit and would otherwise take the taps.
    zIndex: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  hearts: {
    gap: space.sm,
  },
  // Above the actions (zIndex / elevation 2).
  bubbles: {
    ...StyleSheet.absoluteFill,
    zIndex: 3,
    elevation: 3,
  },
  empty: {
    ...type.body,
    textAlign: "center",
    paddingVertical: space.lg,
  },
});
