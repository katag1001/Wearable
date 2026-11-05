// Settings: whether AI analyses new item photos (saved as soon as it's
// picked), then what AI costs and why we use it, with sources. Logic:
// useAiSettings (shared with the web).

import { Linking, StyleSheet, Text, View } from "react-native";

import {
  AI_ABOUT_SECTIONS,
  AI_CHOICES,
  AI_SETTINGS_DESCRIPTION,
  AI_SOURCES,
  AI_USAGE_TEXT,
  AI_USAGE_TITLE,
  DAILY_PHOTO_LIMIT,
} from "@core/constants/aiAnalysis.js";
import { useAiSettings } from "@core/hooks/useAiSettings.js";
import { splitBold } from "@core/utils/boldText.js";

import { colors, fontSizes, fontWeights, spacing } from "../../../../theme/tokens";
import {
  ChoiceCard,
  Loading,
  Message,
  Screen,
  SectionTitle,
} from "../../../../components/ui";

// A paragraph with **bold** parts.
const RichText = ({ text, style }) => (
  <Text style={[styles.text, style]}>
    {splitBold(text).map(({ text: part, bold }, index) => (
      <Text key={index} style={bold ? styles.bold : null}>
        {part}
      </Text>
    ))}
  </Text>
);

const Point = ({ text }) => (
  <View style={styles.point}>
    <Text style={styles.text}>•</Text>
    <RichText text={text} style={styles.pointText} />
  </View>
);

export default function SettingsScreen() {
  const settings = useAiSettings();

  if (settings.loading) {
    return <Loading text="Loading your settings..." />;
  }

  return (
    <Screen edges={["bottom"]}>
      <SectionTitle title="AI photo analysis" description={AI_SETTINGS_DESCRIPTION} />
      {AI_CHOICES.map((option) => (
        <ChoiceCard
          key={option.label}
          label={option.label}
          selected={settings.aiAnalysis === option.value}
          disabled={settings.saving}
          onPress={() => settings.changeAiAnalysis(option.value)}
        />
      ))}

      <Message text={settings.error} />
      <Message text={settings.success} type="success" />

      {AI_ABOUT_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionTitle title={section.title} />
          {section.paragraphs.map((text) => (
            <RichText key={text} text={text} />
          ))}
          {section.points?.map((text) => (
            <Point key={text} text={text} />
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <SectionTitle title={AI_USAGE_TITLE} />
        <RichText
          text={`${AI_USAGE_TEXT} Today: **${settings.usedToday} of ${DAILY_PHOTO_LIMIT}**.`}
        />
      </View>

      <View style={styles.section}>
        <SectionTitle title="Sources" />
        {AI_SOURCES.map((source) => (
          <Text
            key={source.url}
            style={[styles.text, styles.link]}
            accessibilityRole="link"
            onPress={() => Linking.openURL(source.url)}
          >
            {source.label}
          </Text>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  text: {
    fontFamily: fontWeights.regular,
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
  bold: {
    fontFamily: fontWeights.semibold,
    color: colors.main,
  },
  point: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pointText: {
    flex: 1,
  },
  link: {
    textDecorationLine: "underline",
  },
});
