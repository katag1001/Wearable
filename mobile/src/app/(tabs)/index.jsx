// Today tab: "Hey <name>" with the profile button, the day and weather,
// then today's outfit filling the rest of the page - swipe to pick one with
// its shoes (OutfitPicker), then the finished look (WornToday), with
// bubbles rising when it's worn. Change shoes shows ShoeChooser in place of
// the page (the outfits stay loaded behind it), and the broken heart shows
// OutfitFeedback the same way. Drawn in the soft look
// (context/visual-language.md), the atmosphere tinted by the weather.
// Logic: useWeather, useTodayLook - both shared with the web
// homepage.

import { useCallback, useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useTodayLook } from "@core/hooks/useTodayLook.js";
import { useWeather } from "@core/hooks/useWeather.js";
import { getTodayDayOfWeek } from "@core/utils/dates.js";

import { useSession } from "../../auth/SessionProvider";
import { takeEditedOutfits, takeRemovedOutfits } from "../../components/outfits/outfitHandoff";
import {
  BubbleCelebration,
  BubbleLoader,
  SoftNote,
  SoftScreen,
  WeatherIcon,
} from "../../components/soft";
import { OutfitFeedback } from "../../components/today/OutfitFeedback";
import { OutfitPicker } from "../../components/today/OutfitPicker";
import { ShoeChooser } from "../../components/today/ShoeChooser";
import { WornToday } from "../../components/today/WornToday";
import { useLocation } from "../../platform/useLocation";
import { fonts, ink, space } from "../../theme/soft";

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);


export default function TodayScreen() {
  const { firstName } = useSession();
  const location = useLocation();
  const weather = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    locationUnavailable: Boolean(location.error),
  });
  const today = useTodayLook({ todayReady: weather.ready, tagFilter: false });

  // Over the whole page while true.
  const [celebrating, setCelebrating] = useState(false);
  const [choosingShoes, setChoosingShoes] = useState(false);
  const [givingFeedback, setGivingFeedback] = useState(false);

  // Coming back from the outfit screen: show its changes.
  useFocusEffect(
    useCallback(() => {
      const edited = takeEditedOutfits();

      Object.entries(edited).forEach(([matchId, fields]) =>
        today.updateMatch(matchId, fields)
      );

      const removed = takeRemovedOutfits();

      if (removed.length) today.dropOutfits(removed);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Errors from wearing and the broken heart. Marking worn has the bubble
  // celebration instead of an alert.
  useEffect(() => {
    if (today.notice?.kind === "worn") {
      today.clearNotice();
    } else if (today.notice) {
      Alert.alert(today.notice.title, today.notice.message, [
        { text: "OK", onPress: today.clearNotice },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.notice]);

  const showingWorn =
    !today.loading &&
    !today.checkingToday &&
    !today.message &&
    Boolean(today.wornToday) &&
    !today.showSelector;

  const outfitSection = () => {
    if (!weather.ready && today.loading) {
      return weather.error ? null : <BubbleLoader text="Loading outfits" />;
    }

    if (today.loading || today.checkingToday) {
      return <BubbleLoader text="Preparing today's outfits" />;
    }

    if (today.message) {
      return <SoftNote text={today.message} />;
    }

    if (showingWorn) {
      return (
        <WornToday today={today} onChangeShoes={() => setChoosingShoes(true)} />
      );
    }

    return (
      <OutfitPicker
        today={today}
        onCelebrate={() => setCelebrating(true)}
        onChangeShoes={() => setChoosingShoes(true)}
        onNotThisOutfit={() => setGivingFeedback(true)}
      />
    );
  };

  if (givingFeedback) {
    return <OutfitFeedback today={today} onClose={() => setGivingFeedback(false)} />;
  }

  // The worn outfit's shoes are saved straight away.
  if (choosingShoes) {
    return (
      <ShoeChooser
        footwear={today.footwear}
        outfit={showingWorn ? today.wornOutfit : today.selectedOutfit}
        startShoe={showingWorn ? today.wornShoe : today.selectedShoe}
        chooseLabel={showingWorn ? "Wear these" : "Choose these"}
        wearing={showingWorn}
        onChoose={showingWorn ? today.changeWornShoe : today.chooseShoe}
        onClose={() => setChoosingShoes(false)}
      />
    );
  }

  const tag = today.todayTag ? `${capitalise(today.todayTag)} outfit` : "Today";

  return (
    <SoftScreen
      weather={weather.weather}
      // Fixed to the screen (no scrolling) - the outfit photos shrink to
      // fit it.
      scroll={false}
    >
      {/* The greeting, with the way to the profile menu on the right. */}
      <View style={styles.greetingRow}>
        <Text style={styles.greeting} numberOfLines={1}>
          {firstName ? `Hey ${firstName}` : "Hello"}
        </Text>
        <Pressable
          onPress={() => router.push("/profile")}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={12}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Feather name="user" size={22} color={ink.soft} />
        </Pressable>
      </View>

      {/* Two matching columns: weekday over tag on the left, temperature
          over season on the right, line for line. */}
      <View style={styles.header}>
        <View style={styles.column}>
          <Text style={styles.headline}>{capitalise(getTodayDayOfWeek())}</Text>
          <Text style={styles.subline}>{tag}</Text>
        </View>

        {weather.weather ? (
          <View style={[styles.column, styles.right]}>
            <View style={styles.temperature}>
              <WeatherIcon code={weather.weather.code} />
              <Text style={styles.headline}>
                {weather.weather.min}° – {weather.weather.max}°
              </Text>
            </View>
            <Text style={styles.subline}>
              {weather.isFallback ? "Last known · " : ""}
              {weather.season}
            </Text>
          </View>
        ) : !weather.error && !location.error ? (
          <View style={[styles.column, styles.right, styles.waiting]}>
            <Text style={styles.subline}>Finding the weather</Text>
          </View>
        ) : null}
      </View>

      <SoftNote text={location.error} />
      <SoftNote text={weather.error} />
      {/* When few outfits fit the weather (shared/todayMessages.json). */}
      <SoftNote text={today.weatherNoticeText} type="success" />

      <View style={styles.outfit}>{outfitSection()}</View>

      {celebrating ? (
        <BubbleCelebration onDone={() => setCelebrating(false)} />
      ) : null}
    </SoftScreen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  greeting: {
    flexShrink: 1,
    fontFamily: fonts.light,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: ink.main,
  },
  pressed: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.sm,
    marginBottom: space.xs,
  },
  column: {
    gap: space.xxs,
    flexShrink: 1,
  },
  right: {
    alignItems: "flex-end",
  },
  // Level with the season line when there's no temperature yet.
  waiting: {
    justifyContent: "flex-end",
  },
  headline: {
    fontFamily: fonts.light,
    fontSize: 20,
    lineHeight: 26,
    color: ink.main,
  },
  // The tag and season: the same light Inter as the line above, smaller,
  // in spaced capitals.
  subline: {
    fontFamily: fonts.light,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: ink.soft,
  },
  temperature: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  outfit: {
    flex: 1,
  },
});
