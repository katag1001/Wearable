// The AI consent prompt before adding an item (logic: useAiConsent, shared
// with the web). There's no way past it without answering. Once answered,
// "Preference saved!" until OK, with "Read more" opening Settings'
// about-AI text.

import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";

import {
  AI_CHOICES,
  AI_CONSENT_MESSAGE,
  AI_CONSENT_SAVED_MESSAGE,
} from "@core/constants/aiAnalysis.js";

import { type } from "../../theme/soft";
import { Button, Message } from "../ui";

export const AiConsentPrompt = ({ consent }) => {
  if (consent.showSaved) {
    return (
      <>
        <Text style={styles.text}>{AI_CONSENT_SAVED_MESSAGE}</Text>
        <Button label="OK" onPress={consent.acknowledge} />
        <Button
          label="Read more"
          variant="text"
          onPress={() => router.push("/account/settings")}
        />
      </>
    );
  }

  return (
    <>
      <Text style={styles.text}>{AI_CONSENT_MESSAGE}</Text>
      {AI_CHOICES.map(({ value, label }) => (
        <Button
          key={label}
          label={label}
          variant={value ? "soft" : "secondary"}
          disabled={consent.saving}
          onPress={() => consent.answer(value)}
        />
      ))}
      <Message text={consent.error} />
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    ...type.body,
    textAlign: "center",
  },
});
