// One row of same-width items that scrolls sideways forever: past the last
// item it carries on with the first again, in both directions. The items
// are laid out three times over, and whenever a scroll settles outside the
// middle copy it jumps (invisibly - the copies are identical) to the same
// spot in the middle one. With too few items to fill the row, it's a plain
// row that doesn't loop.
//
// `itemWidth` + `gap` must be the real sizes (they're used to work out the
// positions). renderItem(item) and keyExtractor(item) as for a FlatList.

import { useRef, useState } from "react";
import { FlatList, View } from "react-native";

const COPIES = 3;

export const LoopingRow = ({
  items,
  itemWidth,
  gap,
  renderItem,
  keyExtractor,
  contentPadding = 0,
  style,
}) => {
  const listRef = useRef(null);
  const [rowWidth, setRowWidth] = useState(0);

  const step = itemWidth + gap;
  const setLength = items.length * step;
  const loops = rowWidth > 0 && setLength > rowWidth;

  const data = loops
    ? Array.from({ length: COPIES }, (_, copy) =>
        items.map((item) => ({ item, key: `${copy}-${keyExtractor(item)}` }))
      ).flat()
    : items.map((item) => ({ item, key: keyExtractor(item) }));

  // Back into the middle copy once a scroll has settled outside it.
  const recentre = (event) => {
    if (!loops) return;

    const x = event.nativeEvent.contentOffset.x;
    let next = x;

    if (x < setLength * 0.5) next = x + setLength;
    else if (x > setLength * 1.5) next = x - setLength;

    if (next !== x) {
      listRef.current?.scrollToOffset({ offset: next, animated: false });
    }
  };

  return (
    <View
      style={style}
      onLayout={(event) => setRowWidth(event.nativeEvent.layout.width)}
    >
      <FlatList
        // A new key when looping starts or stops, so it opens on the middle
        // copy.
        key={loops ? "loop" : "plain"}
        ref={listRef}
        horizontal
        data={data}
        keyExtractor={(entry) => entry.key}
        renderItem={({ item: entry }) => renderItem(entry.item)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap, paddingHorizontal: contentPadding }}
        getItemLayout={(_, index) => ({
          length: step,
          offset: contentPadding + index * step,
          index,
        })}
        initialScrollIndex={loops ? items.length : 0}
        onMomentumScrollEnd={recentre}
        // A drag let go without a fling has no momentum end to wait for.
        onScrollEndDrag={(event) => {
          const speed = Math.abs(event.nativeEvent.velocity?.x ?? 0);
          if (speed < 0.05) recentre(event);
        }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};
