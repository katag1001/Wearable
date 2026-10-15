// Profile tab: the web's /user sidebar as a list. Each preferences screen
// opens on top (src/app/account/), and both actions confirm first.

import { router } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";

import { useDeleteAccount } from "@core/hooks/useDeleteAccount.js";
import { colors, fontSizes, spacing } from "@core/theme/tokens.js";

import { useSession } from "../../auth/SessionProvider";
import { ListRow, Loading, Screen } from "../../components/ui";

export default function ProfileScreen() {
  const { userEmail, logout } = useSession();
  const { deleting, deleteAccount } = useDeleteAccount({ onDeleted: logout });

  const confirmLogout = () =>
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", onPress: logout },
    ]);

  const handleDelete = async () => {
    const { ok, error } = await deleteAccount();

    if (!ok) {
      Alert.alert("Delete account", error);
    }
  };

  const confirmDelete = () =>
    Alert.alert(
      "Delete account",
      "This will permanently delete your clothes, outfits, today's outfits, preferences, and all other account data. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete account", style: "destructive", onPress: handleDelete },
      ]
    );

  if (deleting) {
    return <Loading text="Deleting your account..." />;
  }

  return (
    <Screen title="Profile">
      <Text style={styles.email}>{userEmail}</Text>

      <View>
        <ListRow
          label="Weekly preferences"
          onPress={() => router.push("/account/weekly")}
        />
        <ListRow
          label="Style preferences"
          onPress={() => router.push("/account/style")}
        />
        <ListRow label="Stats" onPress={() => router.push("/account/stats")} />
      </View>

      <View style={styles.actions}>
        <ListRow label="Log out" onPress={confirmLogout} chevron={false} />
        <ListRow
          label="Delete account"
          onPress={confirmDelete}
          destructive
          chevron={false}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: {
    fontSize: fontSizes.body,
    color: colors.secondary,
  },
  actions: {
    marginTop: spacing.xl,
  },
});
