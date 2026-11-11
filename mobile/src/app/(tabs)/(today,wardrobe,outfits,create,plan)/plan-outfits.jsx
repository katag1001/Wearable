// Recommended outfits for a planned day (?date=YYYY-MM-DD): the day's
// weather, "By plan | By tag" with the plans or tags to pick from
// (starting on the weekday's tag), then up to 30 outfits for that weather
// - only ones with the plan's tags - one at a time in Today's swipe deck,
// each with its best shoe for the day. Swiping never rejects; there's no
// broken heart. The heart plans the outfit on show with its shoe (and
// favourites it); the shoe button is Change shoes (ShoeChooser in place
// of the page). Logic: useDayWeather, usePlanSuggestions.

import { useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import { useDayWeather } from "@core/hooks/useDayWeather.js";
import { usePlanSuggestions } from "@core/hooks/usePlanSuggestions.js";
import { ALL_TAGS, CHOOSE_BY, PLAN_OCCASIONS } from "@core/plan/planOccasions.js";
import { getTodayDate } from "@core/utils/dates.js";

import {
  Atmosphere,
  BubbleCelebration,
  BubbleLoader,
  SoftNote,
  useHeaderSpace,
} from "../../../components/soft";
import { showDialog } from "../../../components/soft/Dialog";
import { DayWeatherCard } from "../../../components/plan/DayWeatherCard";
import { markPlanChanged } from "../../../components/plan/planChanged";
import { ActionButton } from "../../../components/today/ActionButton";
import { OutfitImages } from "../../../components/today/OutfitImages";
import { ShoeChooser } from "../../../components/today/ShoeChooser";
import { SwipeDeck } from "../../../components/today/SwipeDeck";
import { Chip, ChipRow, EmptyState, SegmentedControl } from "../../../components/ui";
import { useLocation } from "../../../platform/useLocation";
import { space } from "../../../theme/soft";
import { colors } from "../../../theme/tokens";

export default function PlanOutfitsScreen() {
  const { date } = useLocalSearchParams();
  const headerSpace = useHeaderSpace();
  const location = useLocation();
  const dayWeather = useDayWeather({
    date,
    latitude: location.latitude,
    longitude: location.longitude,
  });
  const suggestions = usePlanSuggestions({
    date,
    weather: dayWeather.weather,
    latitude: dayWeather.latitude,
  });

  const [choosingShoes, setChoosingShoes] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const isToday = date === getTodayDate();
  const choices =
    suggestions.chooseBy === "plan" ? PLAN_OCCASIONS.map((plan) => plan.name) : ALL_TAGS;

  const plan = async () => {
    if (!(await suggestions.planCurrent())) return;

    markPlanChanged({ today: isToday });
    setCelebrating(true);
  };

  // After the bubbles: back to the day, which shows the plan.
  const planned = () => {
    setCelebrating(false);

    if (isToday) {
      showDialog("Planned for today", "It's on Today now, marked as worn.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  if (choosingShoes && suggestions.current) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ShoeChooser
          footwear={suggestions.footwear}
          outfit={suggestions.current}
          startShoe={suggestions.shoe}
          chooseLabel="Choose these"
          onChoose={suggestions.chooseShoe}
          onClose={() => setChoosingShoes(false)}
        />
      </>
    );
  }

  const outfitSection = () => {
    if (dayWeather.loading || suggestions.loading) {
      return <BubbleLoader text="Finding your outfits" />;
    }

    if (!dayWeather.weather) return null;

    if (!suggestions.choice) {
      return <EmptyState title="Pick a plan to see outfits for the day" />;
    }

    const { current, shoe } = suggestions;

    if (!current) {
      return (
        <EmptyState
          title="No outfits for this that fit the day's weather"
          text="Try another plan or tag, or build your own."
        />
      );
    }

    return (
      <View style={styles.picker}>
        <View style={styles.deck}>
          <SwipeDeck
            enabled={suggestions.canMove}
            cardKey={current.matchId._id}
            onNext={suggestions.goNext}
            onPrev={suggestions.goPrev}
            noun="outfit"
            fill
          >
            {/* Not touchable, so drags land on the card and swipe it. */}
            <View style={styles.card} pointerEvents="none">
              <OutfitImages
                match={current.matchId}
                footwear={shoe}
                fit
                imageStyle={styles.photo}
              />
            </View>
          </SwipeDeck>
        </View>

        {/* Over the bottom of the photos, as on Today: the heart bottom
            left, the shoe bottom right. */}
        <View style={styles.actions} pointerEvents="box-none">
          <ActionButton
            icon="heart-outline"
            iconSet={MaterialCommunityIcons}
            label="Plan this outfit"
            onPress={plan}
            loading={suggestions.planning}
          />

          {suggestions.footwear.hasFootwear ? (
            <ActionButton
              icon="shoe-sneaker"
              iconSet={MaterialCommunityIcons}
              label="Change shoes"
              onPress={() => setChoosingShoes(true)}
              small
            />
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "Recommended" }} />
      <View style={[styles.screen, { paddingTop: headerSpace }]}>
        <Atmosphere weather={dayWeather.weather} />

        <View style={styles.controls}>
          <DayWeatherCard dayWeather={dayWeather} />

          <SegmentedControl
            options={CHOOSE_BY}
            value={suggestions.chooseBy}
            onChange={suggestions.changeChooseBy}
          />

          <ChipRow scroll>
            {choices.map((choice) => (
              <Chip
                key={choice}
                label={choice}
                selected={choice === suggestions.choice}
                onPress={() => suggestions.choose(choice)}
              />
            ))}
          </ChipRow>

          <SoftNote text={suggestions.error} />
        </View>

        <View style={styles.outfit}>{outfitSection()}</View>

        {celebrating ? <BubbleCelebration onDone={planned} /> : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  controls: {
    gap: space.sm,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
  },
  outfit: {
    flex: 1,
    paddingHorizontal: space.gutter,
    paddingVertical: space.sm,
  },
  picker: {
    flex: 1,
  },
  deck: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    flex: 1,
  },
  // The photos have their backgrounds removed; no tile behind them.
  photo: {
    backgroundColor: "transparent",
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: space.sm,
    // Above the swipe deck's side arrows, as on Today.
    zIndex: 2,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
});
