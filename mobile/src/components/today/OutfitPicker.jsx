// Choosing today's outfit: the sorted outfits one at a time (next rejects
// the one being left), filtered by a tag. Logic: useToday.

import { Alert, StyleSheet, Text, View } from "react-native";

import { tagOptions } from "@core/constants/optionsBank.js";
import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import {
  Button,
  Card,
  Grid,
  SectionTitle,
  TagTile,
} from "../ui";
import { OutfitImages } from "./OutfitImages";
import { Stepper } from "./Stepper";

export const OutfitPicker = ({ today }) => {
  const { filteredOutfits, selectedOutfit } = today;

  const confirmDelete = () =>
    Alert.alert(
      "Delete outfit",
      "Are you sure you want to delete this outfit permanently? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: today.deleteCurrentOutfit,
        },
      ]
    );

  return (
    <>
      <Card>
        {selectedOutfit ? (
          <>
            <OutfitImages match={selectedOutfit.matchId} />

            <Stepper
              index={today.currentIndex}
              total={filteredOutfits.length}
              onPrev={today.goPrev}
              onNext={today.goNext}
              noun="outfit"
            />

            <View style={styles.actions}>
              <Button
                label="Mark as worn today"
                onPress={today.markAsWornToday}
                style={styles.action}
              />
              <Button
                label="Delete"
                variant="secondary"
                onPress={confirmDelete}
                loading={today.deleting}
              />
            </View>
          </>
        ) : (
          <Text style={styles.empty}>
            {today.outfits.length === 0
              ? "No outfits saved for today."
              : "No outfits saved for this tag."}
          </Text>
        )}
      </Card>

      <SectionTitle
        title="Filter by tag"
        description={
          today.todayTag ? `Today's ${today.todayTag} outfit` : undefined
        }
      />
      <Grid columns={5} gap={spacing.sm}>
        {tagOptions.map((tag) => (
          <TagTile
            key={tag.name}
            tag={tag}
            selected={today.selectedTag === tag.name}
            onPress={() => today.selectTag(tag.name)}
          />
        ))}
      </Grid>
    </>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
  empty: {
    fontSize: fontSizes.body,
    color: colors.secondary,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
});
