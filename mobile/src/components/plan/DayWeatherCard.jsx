// A planned day's weather, as a house box: the weather icon (forecast
// only) and the temperatures, over "Forecast" or the estimate's note
// ("Estimate: usually 5° – 10° around this time of year"), and where the
// data comes from (MET Norway / NASA POWER, as their terms ask).
// `dayWeather` is useDayWeather.

import { StyleSheet, Text, View } from "react-native";

import { dayWeatherNote, dayWeatherSource, temperatureText } from "@core/plan/dayWeather.js";

import { houseBox, loaderSizes, space, type } from "../../theme/soft";
import { BubbleLoader } from "../soft/BubbleLoader";
import { SoftNote } from "../soft/SoftNote";
import { WeatherIcon } from "../soft/WeatherIcon";

export const DayWeatherCard = ({ dayWeather }) => {
  if (dayWeather.loading) {
    return (
      <View style={styles.card}>
        <BubbleLoader text="Finding the weather" size={loaderSizes.small} fill={false} />
      </View>
    );
  }

  if (!dayWeather.weather) {
    return <SoftNote text={dayWeather.error} />;
  }

  const { weather } = dayWeather;

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.row}>
        <WeatherIcon code={weather.code} />
        <Text style={styles.temperature}>{temperatureText(weather)}</Text>
      </View>
      <Text style={styles.note}>{dayWeatherNote(weather)}</Text>
      <Text style={styles.source}>{dayWeatherSource(weather)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...houseBox,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: space.xxs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  temperature: type.todayHeadline,
  note: type.todaySubline,
  source: type.caption,
});
