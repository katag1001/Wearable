// The Plan tab: a month calendar to plan outfits for the days ahead
// (context/planning-feature.md) - today up to three months on, a dot on
// each planned day - and the next few plans underneath ("Coming up").
// Tapping a day opens it (plan-day.jsx). Built like the + tab: the title
// in the top panel, the calendar in the bottom one. Comes back up to date
// after a plan changes (planChanged). Logic: usePlanCalendar.

import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { usePlanCalendar } from "@core/hooks/usePlanCalendar.js";

import {
  BottomPanel,
  PageHeader,
  panelPage,
  SoftNote,
  SoftScreen,
  TopPanel,
} from "../../../components/soft";
import { ComingUpList } from "../../../components/plan/ComingUpList";
import { MonthCalendar } from "../../../components/plan/MonthCalendar";
import { takePlanChanged } from "../../../components/plan/planChanged";
import { space } from "../../../theme/soft";

export default function PlanScreen() {
  const calendar = usePlanCalendar();

  useFocusEffect(
    useCallback(() => {
      if (takePlanChanged("calendar")) calendar.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const openDay = (date) => router.push({ pathname: "/plan-day", params: { date } });

  return (
    <SoftScreen scroll={false} edges={[]} contentStyle={panelPage}>
      <TopPanel>
        <PageHeader title="Plan" />
      </TopPanel>

      <BottomPanel>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <MonthCalendar calendar={calendar} onPickDay={openDay} />
          <SoftNote text={calendar.error} />
          <ComingUpList plans={calendar.comingUp} onOpen={openDay} />
        </ScrollView>
      </BottomPanel>
    </SoftScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: space.lg,
    paddingBottom: space.lg,
  },
});
