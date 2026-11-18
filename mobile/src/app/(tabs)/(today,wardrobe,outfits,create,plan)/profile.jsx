// Profile: the web's /user sidebar as a menu, opened from the person
// button on Today and built like it (context/visual-language.md): the top
// panel has a back arrow and the title, the bottom panel one box per
// preferences screen (src/app/account/), then Log out and Delete account
// along its foot. Log out confirms first; Delete account opens its own
// screen (account/delete.jsx), where the user types DELETE. "Take the tour" goes back
// to Today and runs the app tour again (src/tour). Under the menu, the
// weather data credits the sources' terms ask for
// (server/services/weather/weatherSources.js).

import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useSession } from "../../../auth/SessionProvider";
import {
  BottomPanel,
  PageHeader,
  panelPage,
  SoftScreen,
  TopPanel,
} from "../../../components/soft";
import { ListRow, TextAction } from "../../../components/ui";
import { menuTints, space, type } from "../../../theme/soft";
import { showDialog } from "../../../components/soft/Dialog";
import { useTour } from "../../../tour/TourProvider";

export default function ProfileScreen() {
  const { logout } = useSession();
  const tour = useTour();

  // Profile only opens from Today, so back is Today.
  const takeTour = () => {
    router.back();
    tour.start();
  };

  const confirmLogout = () =>
    showDialog("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", onPress: logout },
    ]);

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
          <ListRow
            label="Take the tour"
            text="See how the app works"
            tint={menuTints.tour}
            onPress={takeTour}
          />
        </View>

        <Text style={styles.credits}>
          Weather data from MET Norway (CC BY 4.0). Typical weather from NASA
          Langley Research Center's POWER Project, funded through the NASA
          Earth Science Division.
        </Text>

        {/* Like Today's tag and season: two sublines, one each side. */}
        <View style={styles.actions}>
          <TextAction label="Log out" onPress={confirmLogout} />
          <TextAction label="Delete account" tone="error" onPress={() => router.push("/account/delete")} />
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
  credits: {
    ...type.caption,
    paddingTop: space.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: space.sm,
  },
});
