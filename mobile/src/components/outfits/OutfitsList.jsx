// The Outfits tab's content: outfits in two Pinterest-style columns that
// stack independently (outfitColumns.js). The list logic is useMatchesPage
// (shared with the web); pages load as you scroll. Long-press outfits to
// select several and delete them together.
//
// `itemFilter` shows only outfits with one item ("View new matches"
// after adding clothes), waiting for them to be made if `waitForNew`.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";

import { useAccumulatedPages } from "@core/hooks/useAccumulatedPages.js";
import { useMatchSelection } from "@core/hooks/useMatchSelection.js";
import { useMatchesPage } from "@core/hooks/useMatchesPage.js";
import { seasonOptions } from "@core/constants/optionsBank.js";

import { loaderSizes, space } from "../../theme/soft";
import { FilterSheet } from "../filters/FilterSheet";
import { BubbleLoader, PageHeader, SoftRefreshControl } from "../soft";
import { Button, Chip, ChipRow, EmptyState, Message, SearchRow } from "../ui";
import { CARD_GAP, twoColumnWidth } from "../ui/cardBox";
import { OutfitCard } from "./OutfitCard";
import { splitIntoColumns } from "./outfitColumns";
import { handOverOutfit } from "./outfitHandoff";
import { useOutfitRebuild } from "../../outfitRebuild/OutfitRebuildProvider";
import { OutfitRebuildNote } from "./OutfitRebuildNote";
import { takeOutfitsChanged } from "./outfitsChanged";
import { SelectionBar } from "./SelectionBar";
import { showDialog } from "../soft/Dialog";

// The FlatList's one row: both columns. It's one row so the list keeps
// paging, refresh and its empty / footer states.
const COLUMNS_ROW = [{ key: "columns" }];

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const OutfitsList = ({ itemFilter, waitForNew, onClearItemFilter }) => {
  const outfits = useMatchesPage({
    itemFilter,
    waitForNewMatches: waitForNew,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const list = useAccumulatedPages({
    data: outfits.data,
    dataQuery: outfits.dataQuery,
    filterQuery: outfits.filterQuery,
    listKey: "matches",
    page: outfits.page,
    setPage: outfits.setPage,
    loading: outfits.loading,
  });

  const { selectedIds, toggleSelected, clearSelection } = useMatchSelection(
    list.items
  );
  const selectMode = selectedIds.size > 0;

  const { width: screenWidth } = useWindowDimensions();
  const columnWidth = twoColumnWidth(screenWidth, space.gutter);
  const columns = useMemo(
    () => splitIntoColumns(list.items, columnWidth, CARD_GAP),
    [list.items, columnWidth]
  );

  const renderCard = (match) => (
    <OutfitCard
      key={match._id}
      match={match}
      width={columnWidth}
      selected={selectedIds.has(match._id)}
      selectMode={selectMode}
      onEdit={() => {
        handOverOutfit(match);
        router.push("/outfit");
      }}
      onMismatch={() => {
        handOverOutfit(match);
        router.push({ pathname: "/outfit", params: { mismatch: "1" } });
      }}
      onToggleSelect={toggleSelected}
      onFavouriteToggle={outfits.onFavouriteToggle}
      onChanged={refreshList}
      onError={outfits.setError}
    />
  );

  const refreshList = () => {
    list.restart();
    outfits.refresh();
  };

  // Coming back after building or changing an outfit.
  useFocusEffect(
    useCallback(() => {
      if (takeOutfitsChanged()) {
        refreshList();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Outfits rebuilt after a preference change while this list is showing.
  const { rebuiltCount } = useOutfitRebuild();
  const seenRebuilds = useRef(rebuiltCount);

  useEffect(() => {
    if (rebuiltCount === seenRebuilds.current) return;

    seenRebuilds.current = rebuiltCount;
    takeOutfitsChanged();
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebuiltCount]);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshList();
    setTimeout(() => setRefreshing(false), 600);
  };

  const confirmDelete = (ids) =>
    showDialog(
      ids.length > 1 ? "Delete outfits" : "Delete outfit",
      ids.length > 1
        ? `Are you sure you want to delete ${ids.length} outfits?`
        : "Are you sure you want to delete this outfit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            list.restart();

            if (await outfits.deleteMatches(ids)) {
              clearSelection();
            }
          },
        },
      ]
    );

  return (
    <>
      <View style={styles.header}>
        <PageHeader
          title="Outfits"
          icon="plus"
          iconLabel="Build an outfit"
          onIconPress={() => router.push("/build-outfit")}
        />

        <ChipRow scroll>
          {seasonOptions.map((season) => (
            <Chip
              key={season}
              label={capitalise(season)}
              selected={outfits.selectedSeason === season}
              onPress={() => outfits.toggleSeason(season)}
            />
          ))}
        </ChipRow>

        {itemFilter ? (
          <ChipRow>
            <Chip
              label="Outfits with your new item"
              icon="x"
              selected
              onPress={onClearItemFilter}
            />
          </ChipRow>
        ) : null}

        <SearchRow
          placeholder="Search outfits…"
          value={outfits.searchTerm}
          onChangeText={outfits.setSearchTerm}
          onFilters={() => setShowFilters(true)}
        />

        <Message text={outfits.error} />
        <OutfitRebuildNote />
      </View>

      {outfits.waitingForNewMatch ? (
        <BubbleLoader text="Finding your new matches…" />
      ) : (
        <FlatList
          data={list.items.length ? COLUMNS_ROW : []}
          keyExtractor={(row) => row.key}
          extraData={[columns, selectedIds]}
          contentContainerStyle={[styles.list, selectMode && styles.listUnderBar]}
          renderItem={() => (
            <View style={styles.columns}>
              {columns.map((column, index) => (
                <View key={index} style={styles.column}>
                  {column.map(renderCard)}
                </View>
              ))}
            </View>
          )}
          onEndReached={list.loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <SoftRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            list.isFirstLoad ? (
              <BubbleLoader size={loaderSizes.medium} fill={false} style={styles.spinner} />
            ) : outfits.data?.total === 0 ? (
              <EmptyState
                title="No outfits yet"
                text="Outfits are made for you when you add clothes to your Wardrobe - or build one yourself."
              >
                <Button
                  label="Build an outfit"
                  variant="secondary"
                  onPress={() => router.push("/build-outfit")}
                />
              </EmptyState>
            ) : (
              <EmptyState
                title="No outfits found"
                text="Try a different search or fewer filters."
              />
            )
          }
          ListFooterComponent={
            // Not during the first load: the empty state already shows one.
            list.hasMore && !list.isFirstLoad ? (
              <BubbleLoader size={loaderSizes.medium} fill={false} style={styles.spinner} />
            ) : null
          }
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Floating over the bottom of the list while outfits are picked. */}
      {selectMode && (
        <SelectionBar
          count={selectedIds.size}
          onClear={clearSelection}
          onDelete={() => confirmDelete([...selectedIds])}
          style={styles.selectionBar}
        />
      )}

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={outfits.filters}
        setFilters={outfits.setFilters}
        availableColors={outfits.filterOptions?.colors}
        availablePatterns={outfits.filterOptions?.patterns}
        availableTags={outfits.filterOptions?.tags}
        clothesByCategory={outfits.filterOptions?.clothesByCategory}
        showTemperature
        showSeasons
        showFavourites
        showItemFilter
      />
    </>
  );
};

const styles = StyleSheet.create({
  // The same gutter and top spacing as Today (SoftScreen).
  header: {
    paddingHorizontal: space.gutter,
    paddingTop: space.pageTop,
    paddingBottom: space.sm,
    gap: space.sm,
  },
  list: {
    paddingHorizontal: space.gutter,
    paddingBottom: space.lg,
    flexGrow: 1,
  },
  // Room to scroll the last cards out from under the selection bar.
  listUnderBar: {
    paddingBottom: space.xxl * 2,
  },
  selectionBar: {
    position: "absolute",
    left: space.gutter,
    right: space.gutter,
    bottom: space.sm,
  },
  columns: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: CARD_GAP,
  },
  column: {
    gap: CARD_GAP,
  },
  spinner: {
    marginVertical: space.lg,
  },
});
