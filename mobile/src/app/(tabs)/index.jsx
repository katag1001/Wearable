// Today tab: the weather, then today's outfit filling the rest of the
// page - swipe to pick one with its shoes (OutfitPicker), then the finished
// look (WornToday), with confetti when it's worn. Change shoes shows
// ShoeChooser in place of the page (the outfits stay loaded behind it).
// Logic: useWeather, useTodayLook - both shared with the web
// homepage.

import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { useTodayLook } from "@core/hooks/useTodayLook.js";
import { useWeather } from "@core/hooks/useWeather.js";
import { colors, fontSizes } from "@core/theme/tokens.js";
import {
  formatTodayTitle,
  formatWeatherLine,
} from "@core/weather/weatherText.js";

import { Loading, Message, Screen } from "../../components/ui";
import { takeEditedOutfits } from "../../components/outfits/outfitHandoff";
import { Confetti } from "../../components/today/Confetti";
import { OutfitPicker } from "../../components/today/OutfitPicker";
import { ShoeChooser } from "../../components/today/ShoeChooser";
import { WornToday } from "../../components/today/WornToday";
import { useLocation } from "../../platform/useLocation";

export default function TodayScreen() {
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

  // Coming back from the outfit screen: show its changes.
  useFocusEffect(
    useCallback(() => {
      const edited = takeEditedOutfits();

      Object.entries(edited).forEach(([matchId, fields]) =>
        today.updateMatch(matchId, fields)
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

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
        <WornToday today={today} onChangeShoes={() => setChoosingShoes(true)} />
      );
    }

    return (
      <OutfitPicker
        today={today}
        onCelebrate={() => setCelebrating(true)}
        onChangeShoes={() => setChoosingShoes(true)}
      />
    );
  };

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

  return (
    <Screen
      title={formatTodayTitle(today.todayTag)}
      // Fixed to the screen (no scrolling) - the outfit photos shrink to
      // fit it.
      scroll={false}
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
