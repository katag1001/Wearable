// One outfit, full screen: its photos (with a heart to favourite it and a
// broken heart to mark two of its items as a mismatch), then its seasons,
// temperature range and tags to edit. Opened from the Outfits
// list, or by tapping the outfit on Today (?from=today).
//
// The outfit is handed over by the opener (outfitHandoff); every change is
// handed back (markOutfitEdited) so Today can show it, and the Outfits
// list refreshes (markOutfitsChanged). From Today, wearing and deleting
// stay on Today's own buttons (they wear the shoes too), so only Save
// shows here. Logic: useMatchCard (shared with the web's expanded card).

import { useEffect, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, View } from "react-native";

import { deleteMatches } from "@core/api/matches.js";
import { getErrorMessage } from "@core/api/errors.js";
import { useMatchCard } from "@core/hooks/useMatchCard.js";
import { buildMatchUpdate } from "@core/matches/matchFields.js";
import { colors, radius, spacing } from "@core/theme/tokens.js";

import { OutfitDetails } from "../components/outfits/OutfitDetails";
import { OutfitMismatch } from "../components/outfits/OutfitMismatch";
import {
  markOutfitEdited,
  markOutfitsRemoved,
  takeOutfit,
} from "../components/outfits/outfitHandoff";
import { markOutfitsChanged } from "../components/outfits/outfitsChanged";
import { OutfitImages } from "../components/today/OutfitImages";
import { Button, FavouriteHeart, Message, Screen } from "../components/ui";

export default function OutfitScreen() {
  const { from } = useLocalSearchParams();
  const fromToday = from === "today";

  const [handedOver] = useState(() => takeOutfit());
  const [match, setMatch] = useState(handedOver?.match ?? null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // The broken heart's item picker, in place of the screen while open.
  const [mismatching, setMismatching] = useState(false);

  // This screen's copy; the changes are handed back to Today too.
  const changeMatch = (fields) => {
    setMatch((prev) => ({ ...prev, ...fields }));
    markOutfitEdited(match._id, fields);
  };

  const card = useMatchCard({
    match: match ?? {},
    onChanged: markOutfitsChanged,
    onFavouriteToggle: (_, favourite) => {
      changeMatch({ favourite });
      markOutfitsChanged();
    },
    onError: setError,
  });

  // Opened without an outfit (e.g. after a reload) - nothing to show.
  useEffect(() => {
    if (!match) {
      router.back();
      return;
    }

    card.startEditing();
    // Once, for the outfit this screen opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!match) return null;

  const handleSave = async () => {
    const fields = buildMatchUpdate(card.draft);

    if (await card.save()) {
      changeMatch(fields);
      router.back();
    }
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
          onClose={() => setMismatching(false)}
          onMismatched={handleMismatched}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Outfit",
          headerBackTitle: fromToday ? "Today" : "Outfits",
        }}
      />
      <Screen edges={["bottom"]}>
        <View>
          <OutfitImages match={match} footwear={handedOver.footwear} />
          <View style={styles.cornerIcons}>
            <Pressable
              onPress={() => setMismatching(true)}
              accessibilityRole="button"
              accessibilityLabel="Mismatch"
              hitSlop={10}
              style={styles.brokenHeart}
            >
              <MaterialCommunityIcons
                name="heart-broken-outline"
                size={24}
                color={colors.muted}
              />
            </Pressable>
            <FavouriteHeart
              favourite={match.favourite}
              onPress={card.toggleFavourite}
              size={24}
            />
          </View>
        </View>

        <OutfitDetails card={card} />

        <Message text={error} />

        <View style={styles.actions}>
          {!fromToday && (
            <Button
              label={card.wornToday ? "Worn today" : "Mark as worn today"}
              variant="secondary"
              onPress={handleMarkWorn}
              loading={card.markingWorn}
              disabled={card.wornToday}
              style={styles.action}
            />
          )}
          <Button
            label="Save"
            onPress={handleSave}
            loading={card.saving}
            disabled={!card.draft}
            style={styles.action}
          />
        </View>

        {!fromToday && (
          <Button
            label="Delete outfit"
            variant="text"
            onPress={confirmDelete}
            loading={deleting}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  cornerIcons: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing.sm,
  },
  // Matches FavouriteHeart's background.
  brokenHeart: {
    padding: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.pageBackground,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
