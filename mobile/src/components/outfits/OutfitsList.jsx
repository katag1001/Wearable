// The Outfits tab's content. The list logic is useMatchesPage (shared with
// the web); pages load as you scroll. Long-press outfits to select several
// and delete them together.
//
// `itemFilter` shows only outfits with one item ("View new matches"
// after adding clothes), waiting for them to be made if `waitForNew`.

import { useCallback, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { seasonOptions } from "@core/constants/optionsBank.js";
import { useAccumulatedPages } from "@core/hooks/useAccumulatedPages.js";
import { useMatchSelection } from "@core/hooks/useMatchSelection.js";
import { useMatchesPage } from "@core/hooks/useMatchesPage.js";

import { colors, radius, spacing } from "../../theme/tokens";
import { space } from "../../theme/soft";
import { FilterSheet } from "../filters/FilterSheet";
import { PageHeader } from "../soft";
import { Button, Chip, ChipRow, EmptyState, Message, TextField } from "../ui";
import { OutfitCard } from "./OutfitCard";
import { handOverOutfit } from "./outfitHandoff";
import { takeOutfitsChanged } from "./outfitsChanged";
import { SelectionBar } from "./SelectionBar";

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

  const handleRefresh = () => {
    setRefreshing(true);
    refreshList();
    setTimeout(() => setRefreshing(false), 600);
  };

  const confirmDelete = (ids) =>
    Alert.alert(
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
          count={outfits.count}
          icon="plus"
          iconLabel="Build an outfit"
          onIconPress={() => router.push("/build-outfit")}
        />

        {itemFilter ? (
          <ChipRow>
            <Chip
              label="Outfits with your new item  ✕"
              selected
              onPress={onClearItemFilter}
            />
          </ChipRow>
        ) : null}

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

        <View style={styles.searchRow}>
          <TextField
            placeholder="Search outfits..."
            value={outfits.searchTerm}
            onChangeText={outfits.setSearchTerm}
            autoCapitalize="none"
            returnKeyType="search"
            style={styles.search}
          />
          <Pressable
            onPress={() => setShowFilters(true)}
            accessibilityRole="button"
            accessibilityLabel="Filters"
            style={styles.filterButton}
          >
            <Feather name="sliders" size={20} color={colors.main} />
          </Pressable>
        </View>

        {selectMode && (
          <SelectionBar
            count={selectedIds.size}
            onClear={clearSelection}
            onDelete={() => confirmDelete([...selectedIds])}
          />
        )}

        <Message text={outfits.error} />
      </View>

      {outfits.waitingForNewMatch ? (
        <EmptyState title="Finding your new matches...">
          <ActivityIndicator color={colors.muted} />
        </EmptyState>
      ) : (
        <FlatList
          data={list.items}
          keyExtractor={(match) => match._id}
          contentContainerStyle={styles.list}
          renderItem={({ item: match }) => (
            <OutfitCard
              match={match}
              selected={selectedIds.has(match._id)}
              selectMode={selectMode}
              onEdit={() => {
                handOverOutfit(match);
                router.push("/outfit");
              }}
              onToggleSelect={toggleSelected}
              onFavouriteToggle={outfits.onFavouriteToggle}
              onChanged={refreshList}
              onError={outfits.setError}
            />
          )}
          onEndReached={list.loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            list.isFirstLoad ? (
              <ActivityIndicator color={colors.muted} style={styles.spinner} />
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
                title="No outfits found."
                text="Try a different search or fewer filters."
              />
            )
          }
          ListFooterComponent={
            list.hasMore ? (
              <ActivityIndicator color={colors.muted} style={styles.spinner} />
            ) : null
          }
          keyboardShouldPersistTaps="handled"
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
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  search: {
    flex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
});
