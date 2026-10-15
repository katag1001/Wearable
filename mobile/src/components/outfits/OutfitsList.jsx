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
  Text,
  View,
} from "react-native";

import { seasonOptions } from "@core/constants/optionsBank.js";
import { useAccumulatedPages } from "@core/hooks/useAccumulatedPages.js";
import { useMatchSelection } from "@core/hooks/useMatchSelection.js";
import { useMatchesPage } from "@core/hooks/useMatchesPage.js";
import {
  colors,
  fontSizes,
  fontWeights,
  spacing,
} from "@core/theme/tokens.js";

import { FilterSheet } from "../filters/FilterSheet";
import { Button, Chip, ChipRow, EmptyState, Message, TextField } from "../ui";
import { OutfitCard } from "./OutfitCard";
import { OutfitEditorSheet } from "./OutfitEditorSheet";
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
  const [editingId, setEditingId] = useState(null);

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

  // The latest copy, so the editor sees changes (e.g. worn today).
  const editingMatch = list.items.find((match) => match._id === editingId);

  const refreshList = () => {
    list.restart();
    outfits.refresh();
  };

  // Coming back after building an outfit.
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
            setEditingId(null);
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
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            Outfits
            {outfits.count ? (
              <Text style={styles.count}> ({outfits.count})</Text>
            ) : null}
          </Text>

          <Button
            label="Build"
            variant="secondary"
            onPress={() => router.push("/build-outfit")}
          />
        </View>

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
          <ActivityIndicator color={colors.main} />
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
              onEdit={() => setEditingId(match._id)}
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
              <ActivityIndicator color={colors.main} style={styles.spinner} />
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
              <ActivityIndicator color={colors.main} style={styles.spinner} />
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
        availableStyles={outfits.filterOptions?.styles}
        availableTags={outfits.filterOptions?.tags}
        clothesByCategory={outfits.filterOptions?.clothesByCategory}
        showTemperature
        showFavourites
        showItemFilter
      />

      {editingMatch && (
        <OutfitEditorSheet
          key={editingMatch._id}
          match={editingMatch}
          onClose={() => setEditingId(null)}
          onChanged={refreshList}
          onFavouriteToggle={outfits.onFavouriteToggle}
          onError={outfits.setError}
          onDelete={(id) => confirmDelete([id])}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.semibold,
    color: colors.main,
  },
  count: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular,
    color: colors.secondary,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
