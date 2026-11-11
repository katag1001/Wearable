// One day on the Plan tab (?date=YYYY-MM-DD): its weather on top - the
// forecast within the week, an estimate after that - then either its plan
// (the outfit with its shoe, and Change outfit / Change shoes / Remove
// plan) or the two ways to plan it: Recommend outfits (plan-outfits.jsx)
// and Build my own (build-outfit.jsx?planDate=). Change outfit shows the
// two ways again. Change shoes shows ShoeChooser in place of the page,
// the shoes ranked for the day. Planning today itself puts the outfit
// straight on Today as worn (server/services/planService.js), so today
// never shows a plan here. Reloads after a plan is made (planChanged).
// Logic: useDayWeather, usePlanDay.

import { useCallback, useState } from "react";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { useDayWeather } from "@core/hooks/useDayWeather.js";
import { usePlanDay } from "@core/hooks/usePlanDay.js";
import { dayTitle } from "@core/plan/calendar.js";
import { getTodayDate } from "@core/utils/dates.js";

import { Atmosphere, BubbleLoader, SoftNote, useHeaderSpace } from "../../../components/soft";
import { showDialog } from "../../../components/soft/Dialog";
import { DayWeatherCard } from "../../../components/plan/DayWeatherCard";
import { markPlanChanged, takePlanChanged } from "../../../components/plan/planChanged";
import { OutfitImages } from "../../../components/today/OutfitImages";
import { ShoeChooser } from "../../../components/today/ShoeChooser";
import { ActionCard, ActionCards, Button } from "../../../components/ui";
import { useLocation } from "../../../platform/useLocation";
import { choiceTints, space } from "../../../theme/soft";
import { colors } from "../../../theme/tokens";

// The planned outfit's height on the page.
const OUTFIT_HEIGHT = 360;

export default function PlanDayScreen() {
  const { date } = useLocalSearchParams();
  const headerSpace = useHeaderSpace();
  const location = useLocation();
  const dayWeather = useDayWeather({
    date,
    latitude: location.latitude,
    longitude: location.longitude,
  });
  const day = usePlanDay({ date, weather: dayWeather.weather });

  // Change outfit: the two ways to plan it, in place of the plan.
  const [choosingOutfit, setChoosingOutfit] = useState(false);
  const [choosingShoes, setChoosingShoes] = useState(false);

  const isToday = date === getTodayDate();

  useFocusEffect(
    useCallback(() => {
      if (takePlanChanged("day")) {
        setChoosingOutfit(false);
        day.reload();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const changeShoe = async (shoe) => {
    const saved = await day.changeShoe(shoe);

    if (saved) markPlanChanged();

    return saved;
  };

  const confirmRemove = () =>
    showDialog("Remove plan", "Take this outfit off this day? The outfit stays in your outfits.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          if (await day.remove()) markPlanChanged();
        },
      },
    ]);

  if (choosingShoes && day.plan) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ShoeChooser
          footwear={day.footwear}
          outfit={day.plan.outfit}
          startShoe={day.plan.footwear}
          chooseLabel="Choose these"
          onChoose={changeShoe}
          onClose={() => setChoosingShoes(false)}
        />
      </>
    );
  }

  const waysToPlan = (
    <ActionCards>
      <ActionCard
        icon="star"
        title="Recommend outfits"
        text="For the day's weather"
        tint={choiceTints.recommendOutfits}
        onPress={() => router.push({ pathname: "/plan-outfits", params: { date } })}
      />
      <ActionCard
        icon="layers"
        title="Build my own"
        text="From your wardrobe"
        tint={choiceTints.buildOwnOutfit}
        onPress={() => router.push({ pathname: "/build-outfit", params: { planDate: date } })}
      />
    </ActionCards>
  );

  const body = () => {
    if (day.loading) return <BubbleLoader text="Loading the day" fill={false} />;

    if (!day.plan || choosingOutfit) {
      return (
        <>
          {isToday ? (
            <SoftNote type="info" text="Planning today puts the outfit straight on Today, marked as worn." />
          ) : null}
          {waysToPlan}
          {choosingOutfit ? (
            <Button label="Keep this outfit" variant="text" onPress={() => setChoosingOutfit(false)} />
          ) : null}
        </>
      );
    }

    return (
      <>
        <View style={styles.outfit}>
          <OutfitImages match={day.plan.outfit.matchId} footwear={day.plan.footwear} fit />
        </View>

        <View style={styles.buttons}>
          <Button label="Change outfit" variant="secondary" onPress={() => setChoosingOutfit(true)} />
          {day.footwear.hasFootwear ? (
            <Button label="Change shoes" variant="secondary" onPress={() => setChoosingShoes(true)} />
          ) : null}
          <Button label="Remove plan" variant="text" onPress={confirmRemove} loading={day.saving} />
        </View>
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: dayTitle(date) }} />
      <View style={[styles.screen, { paddingTop: headerSpace }]}>
        <Atmosphere weather={dayWeather.weather} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <DayWeatherCard dayWeather={dayWeather} />
          <SoftNote text={day.error} />
          {body()}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  content: {
    gap: space.md,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  outfit: {
    height: OUTFIT_HEIGHT,
  },
  buttons: {
    gap: space.sm,
  },
});
