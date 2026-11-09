// Today tab: "Hey <name>" with the profile button, the day and weather,
// then today's outfit filling the rest of the page - swipe to pick one with
// its shoes (OutfitPicker). Wearing it leaves the page as it is - only the
// buttons change, to Change outfit - with bubbles rising over it. Change shoes shows ShoeChooser in place of
// the page (the outfits stay loaded behind it), and the broken heart shows
// OutfitFeedback the same way. Tapping "[tag] outfit" slides up TagPicker
// to pick another tag for today (today only). Drawn in the soft look
// (context/visual-language.md), the atmosphere tinted by the weather.
// The page is two tabs: the greeting, day and weather on one pulled down
// from the top, everything else on one pulled up from the bottom, with a
// strip of the weather-tinted atmosphere showing between them.
// Logic: useWeather, useTodayLook - both shared with the web
// homepage.

import { useCallback, useEffect, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useTodayLook } from "@core/hooks/useTodayLook.js";
import { useWeather } from "@core/hooks/useWeather.js";
import { getTodayDayOfWeek } from "@core/utils/dates.js";

import { useSession } from "../../../auth/SessionProvider";
import {
  takeEditedOutfits,
  takeRemovedOutfits,
} from "../../../components/outfits/outfitHandoff";
import { OutfitRebuildNote } from "../../../components/outfits/OutfitRebuildNote";
import {
  BottomPanel,
  BubbleCelebration,
  BubbleLoader,
  PageHeader,
  panelPage,
  PressableScale,
  SoftNote,
  SoftScreen,
  TopPanel,
  WeatherIcon,
} from "../../../components/soft";
import { OutfitFeedback } from "../../../components/today/OutfitFeedback";
import { OutfitPicker } from "../../../components/today/OutfitPicker";
import { ShoeChooser } from "../../../components/today/ShoeChooser";
import { TagPicker } from "../../../components/today/TagPicker";
import { useOutfitRebuild } from "../../../outfitRebuild/OutfitRebuildProvider";
import { useLocation } from "../../../platform/useLocation";
import { space, type } from "../../../theme/soft";
import { showDialog } from "../../../components/soft/Dialog";

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
  const [pickingTag, setPickingTag] = useState(false);

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

  // Today's list built again after a preference change: show the new one.
  const { rebuiltCount } = useOutfitRebuild();
  const seenRebuilds = useRef(rebuiltCount);

  useEffect(() => {
    if (rebuiltCount === seenRebuilds.current) return;

    seenRebuilds.current = rebuiltCount;
    if (weather.ready) today.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebuiltCount]);

  // Errors from wearing and the broken heart. Marking worn has the bubble
  // celebration instead of an alert.
  useEffect(() => {
    if (today.notice?.kind === "worn") {
      today.clearNotice();
    } else if (today.notice) {
      showDialog(today.notice.title, today.notice.message, [
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

    if (today.changingTag) {
      return <BubbleLoader text="Finding your outfits" />;
    }

    if (today.loading || today.checkingToday) {
      return <BubbleLoader text="Preparing today's outfits" />;
    }

    if (today.message) {
      return <SoftNote text={today.message} />;
    }

    // The same picker either way, so wearing the outfit changes nothing on
    // screen but the buttons (and the bubbles fly over it).
    return (
      <OutfitPicker
        today={today}
        worn={showingWorn}
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
      // The top tab runs up under the status bar, so the page handles the
      // safe area and gutter itself.
      edges={[]}
      contentStyle={panelPage}
    >
      {/* The top tab, pulled down from the top of the screen. */}
      <TopPanel>
        {/* The greeting, with the way to the profile menu on the right. */}
        <PageHeader
          title={firstName ? `Hey ${firstName}` : "Hello"}
          icon="user"
          iconLabel="Profile"
          onIconPress={() => router.push("/profile")}
        />

        {/* Two matching columns: weekday over tag on the left, temperature
            over season on the right, line for line. */}
        <View style={styles.header}>
          <View style={styles.column}>
            <Text style={styles.headline}>{capitalise(getTodayDayOfWeek())}</Text>
            {/* Needs today's weather: a new tag can mean building today's
                list again. */}
            <PressableScale
              onPress={() => setPickingTag(true)}
              disabled={!weather.weather || today.changingTag}
              accessibilityRole="button"
              accessibilityHint="Pick another tag for today's outfits"
              hitSlop={8}
            >
              <Text style={styles.subline}>{tag}</Text>
            </PressableScale>
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
      </TopPanel>

      {/* The bottom tab, pulled up to meet it. */}
      <BottomPanel>
        <SoftNote text={location.error} />
        <SoftNote text={weather.error} />
        {/* When few outfits fit the weather (shared/todayMessages.json). */}
        <SoftNote text={today.weatherNoticeText} type="info" />
        <OutfitRebuildNote />

        <View style={styles.outfit}>{outfitSection()}</View>
      </BottomPanel>

      <TagPicker
        visible={pickingTag}
        todayTag={today.todayTag}
        onPick={(tagName) => today.pickTag(tagName, weather.weather, weather.season)}
        onClose={() => setPickingTag(false)}
      />

      {celebrating ? (
        <BubbleCelebration onDone={() => setCelebrating(false)} />
      ) : null}
    </SoftScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.sm,
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
  headline: type.todayHeadline,
  // The tag and season: the same light Inter as the line above, smaller,
  // in spaced capitals.
  subline: type.todaySubline,
  temperature: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  outfit: {
    flex: 1,
  },
});
