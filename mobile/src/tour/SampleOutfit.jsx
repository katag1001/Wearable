// The outfit Today shows while the tour runs, so its steps have something
// to point at even with an empty wardrobe: a large hanger over "Outfit",
// straight on the milk where the outfit's photos would be, with the
// buttons where OutfitPicker has them (the hearts bottom left, the shoe
// bottom right). Nothing here does anything - the tour is on top.

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "../components/today/ActionButton";
import { iconSizes, ink, space, type } from "../theme/soft";
import { TourTarget } from "./TourTarget";

export const SampleOutfit = () => (
  <View style={styles.picker}>
    <View style={styles.deck}>
      <TourTarget name="outfit" style={styles.outfit}>
        <MaterialCommunityIcons name="hanger" size={iconSizes.large} color={ink.muted} />
        <Text style={styles.label}>Outfit</Text>
      </TourTarget>
    </View>

    <View style={styles.actions} pointerEvents="none">
      <View style={styles.hearts}>
        <TourTarget name="mismatch">
          <ActionButton
            icon="heart-broken-outline"
            iconSet={MaterialCommunityIcons}
            label="Not this outfit"
          />
        </TourTarget>
        <TourTarget name="wear">
          <ActionButton
            icon="heart-outline"
            iconSet={MaterialCommunityIcons}
            label="Wear this outfit today"
          />
        </TourTarget>
      </View>

      <TourTarget name="shoes">
        <ActionButton
          icon="shoe-sneaker"
          iconSet={MaterialCommunityIcons}
          label="Change shoes"
          small
        />
      </TourTarget>
    </View>
  </View>
);

const styles = StyleSheet.create({
  picker: {
    flex: 1,
  },
  deck: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  outfit: {
    alignItems: "center",
    gap: space.xs,
  },
  label: type.cardTitle,
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: space.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  hearts: {
    gap: space.sm,
  },
});
