// Picking the two items of an outfit that don't go together: the hint, the
// item tiles, then Confirm mismatch and Back. Used by Today's broken heart
// (OutfitFeedback) and the outfit screen's; the logic is useMismatchPicker.

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, fontSizes, spacing } from "@core/theme/tokens.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { Button, Grid, ImageTile } from "../ui";

export const MismatchPicker = ({
  clothes,
  isSelected,
  onToggle,
  canConfirm,
  saving,
  onConfirm,
  onBack,
}) => (
  <>
    <Text style={styles.hint}>Choose the 2 items that don't go together.</Text>

    <ScrollView contentContainerStyle={styles.items}>
      <Grid columns={2}>
        {clothes.map((item) => (
          <ImageTile
            key={item._id}
            source={item.imageUrl ? { uri: getImageUrl(item.imageUrl, 400) } : null}
            placeholder={item.name}
            label={item.name}
            selected={isSelected(item._id)}
            onPress={() => onToggle(item._id)}
            aspectRatio={3 / 4}
            resizeMode="contain"
          />
        ))}
      </Grid>
    </ScrollView>

    <View style={styles.actions}>
      <Button
        label="Confirm mismatch"
        onPress={onConfirm}
        disabled={!canConfirm}
        loading={saving}
      />
      <Button label="Back" variant="text" onPress={onBack} />
    </View>
  </>
);

const styles = StyleSheet.create({
  hint: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
  items: {
    paddingTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
