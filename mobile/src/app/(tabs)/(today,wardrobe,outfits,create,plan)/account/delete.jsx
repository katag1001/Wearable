// Deleting the account (from Profile): says plainly that everything they've
// stored goes, and only lets them delete once they've typed DELETE
// (context/cloudflare-migration-plan.md). The server removes their
// clothes, photos, outfits, plans, Today, preferences and the account
// (server/controllers/allControllers.js deleteUser). Logic:
// useDeleteAccount (core/), then logging out.

import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useDeleteAccount } from "@core/hooks/useDeleteAccount.js";

import { useSession } from "../../../../auth/SessionProvider";
import { space, type } from "../../../../theme/soft";
import { Button, Loading, Message, Screen, TextField } from "../../../../components/ui";

const CONFIRM_WORD = "DELETE";

const REMOVED = [
  "Your clothes and shoes, and all their photos",
  "Your outfits, favourites and what you've worn",
  "Your plans and Today's outfits",
  "Your style and weekly preferences and settings",
  "Your account itself",
];

export default function DeleteAccountScreen() {
  const { logout } = useSession();
  const { deleting, error, deleteAccount } = useDeleteAccount({ onDeleted: logout });
  const [typed, setTyped] = useState("");

  const confirmed = typed.trim() === CONFIRM_WORD;

  if (deleting) {
    return (
      <Screen pageTitle="Delete account" scroll={false}>
        <Loading text="Deleting your account…" />
      </Screen>
    );
  }

  return (
    <Screen pageTitle="Delete account" onBack={() => router.back()}>
      <Text style={type.body}>
        This permanently deletes everything stored for your account. It can't be undone.
      </Text>

      <View style={styles.list}>
        {REMOVED.map((line) => (
          <Text key={line} style={type.body}>
            • {line}
          </Text>
        ))}
      </View>

      <TextField
        label={`Type ${CONFIRM_WORD} to confirm`}
        value={typed}
        onChangeText={setTyped}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder={CONFIRM_WORD}
      />

      <Message text={error} />

      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={() => router.back()} style={styles.action} />
        <Button label="Delete account" onPress={deleteAccount} disabled={!confirmed} style={styles.action} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space.xxs,
  },
  actions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.xs,
  },
  action: {
    flex: 1,
  },
});
