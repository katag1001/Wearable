// "Coming up" under the Plan tab's calendar: the next few planned days,
// each a house-box row with the day, the outfit's first photo and its
// shoe - tapping one opens the day. `plans` from usePlanCalendar.

import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { dayTitle } from "@core/plan/calendar.js";
import { getImageUrl } from "@core/utils/getImageUrl.js";

import { houseBox, iconSizes, ink, radii, space, surface, type } from "../../theme/soft";
import { PressableScale } from "../soft/PressableScale";
import { SectionTitle } from "../ui";

const THUMB_SIZE = 44;

const Thumb = ({ item }) =>
  item?.imageUrl ? (
    <Image
      source={{ uri: getImageUrl(item.imageUrl, 150) }}
      style={styles.thumb}
      contentFit="contain"
      accessibilityLabel={item.name}
    />
  ) : null;

export const ComingUpList = ({ plans, onOpen }) => {
  if (!plans.length) return null;

  return (
    <View style={styles.list}>
      <SectionTitle title="Coming up" />
      {plans.map((plan) => (
        <PressableScale
          key={plan.date}
          onPress={() => onOpen(plan.date)}
          accessibilityRole="button"
          accessibilityLabel={`${dayTitle(plan.date)}, planned`}
          style={styles.row}
        >
          <Text style={styles.day} numberOfLines={1}>
            {dayTitle(plan.date)}
          </Text>
          <View style={styles.thumbs}>
            <Thumb item={plan.outfit.matchId.clothes?.[0]} />
            <Thumb item={plan.footwear} />
          </View>
          <Feather name="arrow-right" size={iconSizes.small} color={ink.muted} />
        </PressableScale>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: space.xs,
  },
  row: {
    ...houseBox,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  day: {
    ...type.caption,
    flex: 1,
  },
  thumbs: {
    flexDirection: "row",
    gap: space.xxs,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii.input,
    backgroundColor: surface.white,
  },
});
