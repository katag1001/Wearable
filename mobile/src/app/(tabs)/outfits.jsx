// Outfits tab. ?item=<id> shows only outfits with that item ("View new
// matches" after adding clothes), and &processing=1 waits for them to be
// made. A new item id starts the list afresh.

import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@core/theme/tokens.js";

import { OutfitsList } from "../../components/outfits/OutfitsList";

export default function OutfitsScreen() {
  const { item, processing } = useLocalSearchParams();
  const itemFilter = typeof item === "string" && item ? item : null;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <OutfitsList
        key={itemFilter ?? "all"}
        itemFilter={itemFilter}
        waitForNew={processing === "1"}
        onClearItemFilter={() =>
          router.setParams({ item: undefined, processing: undefined })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
});
