// Today tab: the weather, then today's outfit filling the rest of the
// page (swipe to pick one, or the one worn today - a small fixed share at
// the top, "Change outfit" at its top right - with its shoes to swipe
// through below).
// Logic: useWeather, useToday, useTodayFootwear - all shared with the web
// homepage.

import { useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useToday } from "@core/hooks/useToday.js";
import { useWeather } from "@core/hooks/useWeather.js";
import { colors, fontSizes, spacing } from "@core/theme/tokens.js";
import {
  formatTodayTitle,
  formatWeatherLine,
} from "@core/weather/weatherText.js";

import { Button, Loading, Message, Screen } from "../../components/ui";
import { OutfitImages } from "../../components/today/OutfitImages";
import { OutfitPicker } from "../../components/today/OutfitPicker";
import { ShoeBox } from "../../components/today/ShoeBox";
import { useLocation } from "../../platform/useLocation";

// The worn outfit's share of the screen height; the shoes get the rest.
const WORN_OUTFIT_SHARE = 0.3;

export default function TodayScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const location = useLocation();
  const weather = useWeather({
    latitude: location.latitude,
    longitude: location.longitude,
    locationUnavailable: Boolean(location.error),
  });
  const today = useToday({ todayReady: weather.ready, tagFilter: false });

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
        <>
          <View
            style={[
              styles.worn,
              { height: Math.round(windowHeight * WORN_OUTFIT_SHARE) },
            ]}
          >
            <Button
              label="Change outfit"
              variant="secondary"
              onPress={today.showOutfitPicker}
              style={styles.change}
            />
            <OutfitImages match={today.wornOutfit?.matchId} fit />
          </View>

          <View style={styles.shoes}>
            <ShoeBox outfit={today.wornOutfit} todayTag={today.todayTag} />
          </View>
        </>
      );
    }

    return <OutfitPicker today={today} />;
  };

  return (
    <Screen
      title={formatTodayTitle(today.todayTag)}
      // Fixed to the screen (no scrolling) so the outfit and shoes split it.
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  outfit: {
    flex: 1,
    gap: spacing.lg,
  },
  worn: {
    gap: spacing.sm,
  },
  // Compact, at the top right of the outfit.
  change: {
    alignSelf: "flex-end",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  shoes: {
    flex: 1,
  },
  weather: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
});
