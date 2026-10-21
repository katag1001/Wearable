// One outfit, full screen: its photos (with a heart to favourite it), then
// its seasons, temperature range and tags to edit. Opened from the Outfits
// list, or by tapping the outfit on Today (?from=today).
//
// The outfit is handed over by the opener (outfitHandoff); every change is
// handed back (markOutfitEdited) so Today can show it, and the Outfits
// list refreshes (markOutfitsChanged). From Today, wearing and deleting
// stay on Today's own buttons (they wear the shoes too), so only Save
// shows here. Logic: useMatchCard (shared with the web's expanded card).

import { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

import { deleteMatches } from "@core/api/matches.js";
import { getErrorMessage } from "@core/api/errors.js";
import { useMatchCard } from "@core/hooks/useMatchCard.js";
import { buildMatchUpdate } from "@core/matches/matchFields.js";
import { spacing } from "@core/theme/tokens.js";

import { OutfitDetails } from "../components/outfits/OutfitDetails";
import { markOutfitEdited, takeOutfit } from "../components/outfits/outfitHandoff";
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

  const confirmDelete = () =>
    Alert.alert("Delete outfit", "Are you sure you want to delete this outfit?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteOutfit },
    ]);

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
          <FavouriteHeart
            favourite={match.favourite}
            onPress={card.toggleFavourite}
            size={24}
            style={styles.heart}
          />
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
  heart: {
    position: "absolute",
    top: 0,
    right: 0,
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
