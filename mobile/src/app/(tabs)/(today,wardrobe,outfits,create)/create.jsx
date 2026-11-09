// The + tab: a choice between adding an item (item/add.jsx, from a photo)
// and building an outfit (build-outfit.jsx). Both screens open on top, the
// same ones Wardrobe's + and Outfits' "Build an outfit" open.

import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../../theme/tokens";
import { choiceTints } from "../../../theme/soft";
import { ActionCard, ActionCards, Screen } from "../../../components/ui";

export default function CreateScreen() {
  return (
    <Screen title="Add" centered>
      <View style={styles.choices}>
        <ActionCards>
          <ActionCard
            icon="camera"
            title="Add item"
            text="Photograph a piece of clothing or footwear"
            tint={choiceTints.addItem}
            onPress={() => router.push("/item/add")}
          />
          <ActionCard
            icon="layers"
            title="Build outfit"
            text="Put an outfit together from your wardrobe"
            tint={choiceTints.buildOutfit}
            onPress={() => router.push("/build-outfit")}
          />
        </ActionCards>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  choices: {
    marginTop: spacing.lg,
  },
});
