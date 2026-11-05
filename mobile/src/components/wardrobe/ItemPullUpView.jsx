// An existing item laid out like an outfit (outfit.jsx): its photo filling
// the page, and its details (ItemForm, without the photo) on a pull-up
// panel - it opens part way up, drags down to see the photo on its own, or
// up to see every field. The photo shrinks and moves up as the panel rises
// to part way (usePhotoFollowsPanel). Tap the photo, or the camera in the
// corner, to change it. `footer` goes under the form (e.g. Delete item).
// There's no Save or Cancel: the screen saves on leaving
// (useSaveItemOnLeave), behind a "Saving..." cover.

import { useRef, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { colors, spacing } from "../../theme/tokens";
import { space } from "../../theme/soft";
import {
  Atmosphere,
  BubbleLoader,
  PULL_UP_PEEK,
  PullUpPanel,
  PullUpScrollView,
  useHeaderSpace,
} from "../soft";
import { ItemForm } from "./ItemForm";
import { DEFAULT_PHOTO_ASPECT, ItemPhoto } from "./ItemPhoto";
import { askForPhoto, photoSource } from "./PhotoPicker";
import { usePhotoFollowsPanel } from "./usePhotoFollowsPanel";

// How much of the page the details panel covers part way up (as on the
// outfit screen). Fully open, it reaches the header.
const PART_WAY = 0.42;

export const ItemPullUpView = ({ form, footer }) => {
  const headerSpace = useHeaderSpace();
  const [pageHeight, setPageHeight] = useState(0);
  const panelOffset = useRef(new Animated.Value(0)).current;
  const [panelHeight, setPanelHeight] = useState(0);
  const [aspect, setAspect] = useState(DEFAULT_PHOTO_ASPECT);
  const partWay = Math.round(pageHeight * PART_WAY);

  const follow = usePhotoFollowsPanel({
    aspect,
    panelOffset,
    panelHeight,
    openVisible: partWay,
  });

  const changePhoto = () => askForPhoto(form.setSelectedImage);

  return (
    <View
      style={[styles.screen, { paddingTop: headerSpace }]}
      onLayout={(event) =>
        setPageHeight(event.nativeEvent.layout.height - headerSpace)
      }
    >
      <Atmosphere />

      {/* The photo, laid out to the panel's tucked-away top. */}
      <View style={styles.photoArea}>
        <View style={styles.fill} onLayout={follow.onLayout}>
          <Animated.View style={[styles.fill, follow.style]}>
            <ItemPhoto
              source={photoSource(form.selectedImage, form.formData.imageUrl)}
              aspect={aspect}
              onAspect={setAspect}
              onPress={changePhoto}
            />
          </Animated.View>
        </View>

        <Pressable
          onPress={changePhoto}
          accessibilityRole="button"
          accessibilityLabel="Change photo"
          hitSlop={10}
          style={({ pressed }) => [styles.cornerIcon, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons
            name="camera-outline"
            size={24}
            color={colors.muted}
          />
        </Pressable>
      </View>

      {pageHeight > 0 && (
        <PullUpPanel
          stops={[PULL_UP_PEEK, partWay, "full"]}
          initialStop={1}
          offset={panelOffset}
          onHeight={setPanelHeight}
          style={{ height: pageHeight }}
          // Part way up, dragging the details moves the panel, so it opens
          // fully from anywhere on it; fully open, they scroll.
          dragContent
        >
          <PullUpScrollView
            style={styles.fill}
            contentContainerStyle={styles.details}
            keyboardShouldPersistTaps="handled"
          >
            <ItemForm
              form={form}
              footer={footer}
              showPhoto={false}
              showActions={false}
            />
          </PullUpScrollView>
        </PullUpPanel>
      )}

      {/* Saving on the way out. */}
      {form.saving ? (
        <View style={styles.saving}>
          <BubbleLoader text="Saving..." />
        </View>
      ) : null}
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
  // Always laid out to the panel's tucked-away top (just the peek below).
  photoArea: {
    flex: 1,
    marginHorizontal: space.gutter,
    marginTop: spacing.sm,
    marginBottom: PULL_UP_PEEK + spacing.md,
  },
  cornerIcon: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.5,
  },
  details: {
    paddingHorizontal: space.gutter,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  // Over everything, so nothing's changed while it saves.
  saving: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.pageBackground,
    opacity: 0.9,
  },
});
