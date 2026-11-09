// Another tag for today's outfits, slid up from the Today header's
// "[tag] outfit": every tag on any of the user's outfits, in the tag
// groups the tag pickers use, today's tag selected. Picking one closes it
// and hands the tag to `onPick` (useToday's pickTag - today only).

import { useEffect, useState } from "react";
import { View } from "react-native";

import { usePagedCache } from "@core/cache/usePagedCache.js";
import { visibleTagGroups } from "@core/utils/tagOptions.js";

import { loaderSizes } from "../../theme/soft";
import { BubbleLoader } from "../soft/BubbleLoader";
import { Chip, ChipRow, EmptyState, Message, SectionTitle, Sheet } from "../ui";

export const TagPicker = ({ visible, todayTag, onPick, onClose }) => {
  const matchesCache = usePagedCache("matches");

  // The tags on the user's outfits (the Outfits filter's options), or
  // null while they load.
  const [tags, setTags] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setFailed(false);

    matchesCache
      .fetchFilterOptions()
      .then((options) => {
        if (!cancelled) setTags(options?.tags ?? []);
      })
      .catch((err) => {
        console.error("Failed to load outfit tags:", err);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, matchesCache]);

  const groups = tags ? visibleTagGroups(tags) : [];

  const body = () => {
    if (failed) return <Message text="Couldn't load your tags." />;
    if (!tags) return <BubbleLoader text="Loading tags…" size={loaderSizes.medium} fill={false} />;
    if (!groups.length) return <EmptyState title="None of your outfits have tags yet" compact />;

    return groups.map(({ group, tags: groupTags }) => (
      <View key={group}>
        <SectionTitle description={group} />
        <ChipRow>
          {groupTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={tag === todayTag}
              onPress={() => {
                onClose();
                onPick(tag);
              }}
            />
          ))}
        </ChipRow>
      </View>
    ));
  };

  return (
    <Sheet visible={visible} title="Today's outfits for" onClose={onClose}>
      {body()}
    </Sheet>
  );
};
