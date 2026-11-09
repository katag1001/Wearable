// Profile: the web's /user sidebar as a menu, opened from the person
// button on Today and built like it (context/visual-language.md): the top
// panel has a back arrow and the title, the bottom panel one box per
// preferences screen (src/app/account/), then Log out and Delete account
// along its foot. Both actions confirm first.

import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { useDeleteAccount } from "@core/hooks/useDeleteAccount.js";

import { useSession } from "../../../auth/SessionProvider";
import {
  BottomPanel,
  PageHeader,
  panelPage,
  SoftScreen,
  TopPanel,
} from "../../../components/soft";
import { ListRow, Loading } from "../../../components/ui";
import { menuTints, semantic, space, type } from "../../../theme/soft";

export default function ProfileScreen() {
  const { logout } = useSession();
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
    <SoftScreen scroll={false} edges={[]} contentStyle={panelPage}>
      <TopPanel>
        <PageHeader title="Profile" onBack={() => router.back()} small />
      </TopPanel>

      <BottomPanel>
        <View style={styles.menu}>
          <ListRow
            label="Weekly preferences"
            text="A tag for each day"
            tint={menuTints.weekly}
            onPress={() => router.push("/account/weekly")}
          />
          <ListRow
            label="Style preferences"
            text="Retake the style quiz"
            tint={menuTints.style}
            onPress={() => router.push("/account/style")}
          />
          <ListRow
            label="Settings"
            text="AI photo analysis"
            tint={menuTints.settings}
            onPress={() => router.push("/account/settings")}
          />
        </View>

        {/* Like Today's tag and season: two sublines, one each side. */}
        <View style={styles.actions}>
          <Pressable
            onPress={confirmLogout}
            accessibilityRole="button"
            hitSlop={12}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.action}>Log out</Text>
          </Pressable>
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            hitSlop={12}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={[styles.action, styles.destructive]}>Delete account</Text>
          </Pressable>
        </View>
      </BottomPanel>
    </SoftScreen>
  );
}

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    paddingTop: space.xs,
    gap: space.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: space.sm,
  },
  action: type.menuText,
  destructive: {
    color: semantic.error,
  },
  pressed: {
    opacity: 0.5,
  },
});
