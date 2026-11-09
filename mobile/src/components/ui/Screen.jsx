// The page wrapper for screens that aren't built by hand. Two looks:
//
// - With `pageTitle`: a page opened from another (Profile's Settings,
//   Add item...), built like Today and Profile (context/visual-language.md)
//   - the top panel holds the back arrow (`onBack`) and the page title, the
//   bottom panel the content. The route hides its stack header.
// - Without it (log in, register, the first style quiz): the content
//   straight on the atmosphere, starting below any transparent stack
//   header, with safe area and standard padding.
//
// Either way: an optional `title` / `subtitle` over the content, scrolling
// by default, and keyboard avoiding built in, so forms don't hide behind
// the keyboard.

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../theme/tokens";
import { space, type } from "../../theme/soft";
import { Atmosphere } from "../soft/Atmosphere";
import { PageHeader } from "../soft/PageHeader";
import { BottomPanel, panelPage, TopPanel } from "../soft/Panels";
import { SoftScreen } from "../soft/SoftScreen";
import { useHeaderSpace } from "../soft/useHeaderSpace";

export const Screen = ({
  pageTitle,
  onBack,
  title,
  subtitle,
  scroll = true,
  centered = false,
  edges = ["top"],
  contentStyle,
  children,
}) => {
  const headerSpace = useHeaderSpace();

  const content = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </>
  );

  const body = (padding) => {
    const contentStyles = [padding, styles.gap, centered && styles.centered, contentStyle];

    return scroll ? (
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[contentStyles, styles.grow]}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
    ) : (
      <View style={[contentStyles, styles.fill]}>{content}</View>
    );
  };

  if (pageTitle) {
    return (
      <SoftScreen scroll={false} edges={[]} contentStyle={panelPage}>
        <TopPanel>
          <PageHeader title={pageTitle} onBack={onBack} small />
        </TopPanel>
        <BottomPanel style={styles.flushPanel}>{body(styles.panelContent)}</BottomPanel>
      </SoftScreen>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: headerSpace }]}>
      <Atmosphere />

      <SafeAreaView style={styles.fill} edges={edges}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {body(styles.content)}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  fill: {
    flex: 1,
  },
  gap: {
    gap: space.sm,
  },
  content: {
    padding: space.gutter,
  },
  // The panel's own padding goes on the scrolling content instead, so it
  // scrolls right to the panel's edges.
  flushPanel: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  panelContent: {
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  grow: {
    flexGrow: 1,
  },
  centered: {
    justifyContent: "center",
  },
  title: type.screenTitle,
  subtitle: {
    ...type.body,
    marginBottom: space.xs,
  },
});
