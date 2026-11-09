// The + tab: a choice between adding an item (item/add.jsx, from a photo)
// and building an outfit (build-outfit.jsx). Both screens open on top, the
// same ones Wardrobe's + and Outfits' "Build an outfit" open. Built like
// Profile (context/visual-language.md), with a tab page's full-size title
// in the top panel and the two choices as house boxes in the bottom one.

import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import {
  BottomPanel,
  PageHeader,
  panelPage,
  SoftScreen,
  TopPanel,
} from "../../../components/soft";
import { ActionCard, ActionCards } from "../../../components/ui";
import { choiceTints, space } from "../../../theme/soft";

export default function CreateScreen() {
  return (
    <SoftScreen scroll={false} edges={[]} contentStyle={panelPage}>
      <TopPanel>
        <PageHeader title="Add" />
      </TopPanel>

      <BottomPanel>
        <View style={styles.choices}>
          <ActionCards>
            <ActionCard
              icon="camera"
              title="Add item"
              text="From a photo"
              tint={choiceTints.addItem}
              onPress={() => router.push("/item/add")}
            />
            <ActionCard
              icon="layers"
              title="Build outfit"
              text="From your wardrobe"
              tint={choiceTints.buildOutfit}
              onPress={() => router.push("/build-outfit")}
            />
          </ActionCards>
        </View>
      </BottomPanel>
    </SoftScreen>
  );
}

const styles = StyleSheet.create({
  choices: {
    paddingTop: space.xs,
  },
});
