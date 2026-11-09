// The homepage's two milk panels (context/visual-language.md): the top one
// runs up under the status bar and is rounded along its bottom edge; the
// bottom one is its mirror image and fills the rest of the screen. Put
// them in a SoftScreen with `scroll={false}`, `edges={[]}` and
// `panelPage` as its contentStyle, so the atmosphere shows between them
// and in their rounded corners.

import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { boxEdge, radii, space, surface } from "../../theme/soft";

export const TopPanel = ({ style, children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.top, { paddingTop: insets.top + space.pageTop }, style]}
    >
      {children}
    </View>
  );
};

export const BottomPanel = ({ style, children }) => (
  <View style={[styles.bottom, style]}>{children}</View>
);

// The page under the panels: no gutter of its own (the panels run edge to
// edge and keep the gutter inside), and the gap the atmosphere shows in.
export const panelPage = {
  paddingHorizontal: 0,
  paddingTop: 0,
  paddingBottom: 0,
  gap: space.sm,
};

const styles = StyleSheet.create({
  // Square at the top, rounded along its bottom edge.
  top: {
    paddingHorizontal: space.gutter,
    paddingBottom: space.md,
    gap: space.sm,
    backgroundColor: surface.milk,
    borderBottomLeftRadius: radii.sheet,
    borderBottomRightRadius: radii.sheet,
    ...boxEdge,
  },
  // The mirror image: rounded along its top edge.
  bottom: {
    flex: 1,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    paddingBottom: space.sm,
    gap: space.sm,
    backgroundColor: surface.milk,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    ...boxEdge,
  },
});
