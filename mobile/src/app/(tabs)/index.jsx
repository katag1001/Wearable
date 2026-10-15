// Today tab: the weather, today's outfit (pick one, or the one worn
// today with its shoes), then this season's clothes and outfits.
// Logic: useWeather, useToday, useTodayFootwear, useSeasonPreviews - all
// shared with the web homepage.

import { useEffect } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import { useToday } from "@core/hooks/useToday.js";
import { useWeather } from "@core/hooks/useWeather.js";
import { colors, fontSizes } from "@core/theme/tokens.js";
import {
  formatTodayTitle,
  formatWeatherLine,
} from "@core/weather/weatherText.js";

import { Button, Card, Loading, Message, Screen } from "../../components/ui";
import { OutfitImages } from "../../components/today/OutfitImages";
import { OutfitPicker } from "../../components/today/OutfitPicker";
import { SeasonPreviews } from "../../components/today/SeasonPreviews";
import { ShoeBox } from "../../components/today/ShoeBox";
import { useLocation } from "../../platform/useLocation";

export default function TodayScreen() {
  const location = useLocation();
  const weather = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    locationUnavailable: Boolean(location.error),
  });
  const today = useToday({ todayReady: weather.ready });

  // Results of marking worn / deleting.
  useEffect(() => {
    if (today.notice) {
      Alert.alert(today.notice.title, today.notice.message, [
        { text: "OK", onPress: today.clearNotice },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.notice]);

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

    if (today.wornToday && !today.showSelector) {
      return (
        <>
          <Card>
            <OutfitImages match={today.wornOutfit?.matchId} />
            <Button
              label="Select a different outfit"
              variant="secondary"
              onPress={today.showOutfitPicker}
            />
          </Card>

          <ShoeBox outfit={today.wornOutfit} todayTag={today.todayTag} />
        </>
      );
    }

    return <OutfitPicker today={today} />;
  };

  return (
    <Screen title={formatTodayTitle(today.todayTag)}>
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

      {outfitSection()}

      <SeasonPreviews />
    </Screen>
  );
}

const styles = StyleSheet.create({
  weather: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
});
