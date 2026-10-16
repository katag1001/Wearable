// Today tab: the weather, then today's outfit filling the rest of the
// page - swipe to pick one (OutfitPicker), then its shoes and the finished
// look (WornToday), with confetti when the shoes are picked.
// Logic: useWeather, useToday, useTodayFootwear - all shared with the web
// homepage.

import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { useToday } from "@core/hooks/useToday.js";
import { useWeather } from "@core/hooks/useWeather.js";
import { colors, fontSizes } from "@core/theme/tokens.js";
import {
  formatTodayTitle,
  formatWeatherLine,
} from "@core/weather/weatherText.js";

import { Loading, Message, Screen } from "../../components/ui";
import { Confetti } from "../../components/today/Confetti";
import { OutfitPicker } from "../../components/today/OutfitPicker";
import { WornToday } from "../../components/today/WornToday";
import { useLocation } from "../../platform/useLocation";

export default function TodayScreen() {
  const location = useLocation();
  const weather = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    locationUnavailable: Boolean(location.error),
  });
  const today = useToday({ todayReady: weather.ready, tagFilter: false });

  // Over the whole page while true.
  const [celebrating, setCelebrating] = useState(false);

  // Results of marking worn / deleting.
  useEffect(() => {
    if (today.notice) {
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
      return weather.error ? null : <Loading text="Loading outfits..." />;
    }

    if (today.loading || today.checkingToday) {
      return <Loading text="Preparing today's outfits..." />;
    }

    if (today.message) {
      return <Message text={today.message} />;
    }

    if (showingWorn) {
      return (
        <WornToday today={today} onCelebrate={() => setCelebrating(true)} />
      );
    }

    return <OutfitPicker today={today} />;
  };

  return (
    <Screen
      title={formatTodayTitle(today.todayTag)}
      // Fixed to the screen (no scrolling) so the worn views fit it.
      scroll={!showingWorn}
    >
      {weather.weather ? (
        <Text style={styles.weather}>
          {formatWeatherLine({ weather: weather.weather, season: weather.season })}
          {weather.isFallback ? " (last known weather)" : ""}
        </Text>
      ) : !weather.error && !location.error ? (
        <Text style={styles.weather}>Loading weather...</Text>
      ) : null}

      <Message text={location.error} />
      <Message text={weather.error} />

      <View style={styles.outfit}>{outfitSection()}</View>

      {celebrating ? <Confetti onDone={() => setCelebrating(false)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  outfit: {
    flex: 1,
  },
  weather: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
});
