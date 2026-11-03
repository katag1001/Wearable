// Wardrobe tab: clothes and footwear, with type / subtype chips, search
// and the filter sheet. The list logic is useWardrobePage (shared with the
// web); pages load as you scroll (useAccumulatedPages) instead of the
// web's page numbers. Pull down to refresh.

import { useCallback, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { router, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAccumulatedPages } from "@core/hooks/useAccumulatedPages.js";
import { useWardrobePage } from "@core/hooks/useWardrobePage.js";

import { colors, radius, spacing } from "../../../theme/tokens";
import { space } from "../../../theme/soft";
import { FilterSheet } from "../../../components/filters/FilterSheet";
import {
  Button,
  EmptyState,
  Message,
  TextField,
} from "../../../components/ui";
import { CARD_GAP, twoColumnWidth } from "../../../components/ui/cardBox";
import {
  handOverItem,
  takeWardrobeChanged,
} from "../../../components/wardrobe/itemHandoff";
import { Atmosphere, PageHeader } from "../../../components/soft";
import { ItemTile } from "../../../components/wardrobe/ItemTile";
import { TypeFilter } from "../../../components/wardrobe/TypeFilter";

const openItemForm = (kind, item = null) => {
  handOverItem(item);
  router.push({
    pathname: "/item/edit",
    params: item ? { kind, edit: "1" } : { kind },
  });
};

// A new item starts from its photo (item/add.jsx), which can still switch
// to adding by hand.
const addItem = () => router.push("/item/add");

export default function WardrobeScreen() {
  const wardrobe = useWardrobePage();
  // Two columns, sized like the outfit cards.
  const columnWidth = twoColumnWidth(useWindowDimensions().width, space.gutter);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const list = useAccumulatedPages({
    data: wardrobe.data,
    dataQuery: wardrobe.dataQuery,
    filterQuery: wardrobe.filterQuery,
    listKey: "items",
    page: wardrobe.page,
    setPage: wardrobe.setPage,
    loading: wardrobe.loading,
  });

  // Coming back from a save / delete on the edit screen.
  useFocusEffect(
    useCallback(() => {
      if (takeWardrobeChanged()) {
        list.restart();
        wardrobe.refresh();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    list.restart();
    wardrobe.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const emptyText = wardrobe.isFootwear
    ? "No footwear found."
    : "No clothes found.";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Atmosphere />

      <View style={styles.header}>
        <PageHeader
          title="Wardrobe"
          count={wardrobe.count}
          icon="plus"
          iconLabel="Add item"
          onIconPress={addItem}
        />

        <TypeFilter wardrobe={wardrobe} />

        <View style={styles.searchRow}>
          <TextField
            placeholder="Search wardrobe..."
            value={wardrobe.searchTerm}
            onChangeText={wardrobe.setSearchTerm}
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

        <Message text={wardrobe.error} />
      </View>

      <FlatList
        data={list.items}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ItemTile
            item={item}
            width={columnWidth}
            onPress={() => openItemForm(wardrobe.kindOnShow, item)}
            {...(!wardrobe.isFootwear && {
              onFavouriteToggled: wardrobe.onItemFavouriteToggled,
              onFavouriteError: wardrobe.setError,
            })}
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
          ) : wardrobe.data?.total === 0 ? (
            // Nothing in this collection at all, not just nothing matching.
            <EmptyState
              title={
                wardrobe.isFootwear ? "No footwear yet" : "Your wardrobe is empty"
              }
              text="Add your first item - outfits are made from your clothes automatically."
            >
              <Button label="Add item" onPress={addItem} />
            </EmptyState>
          ) : (
            <EmptyState
              title={emptyText}
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

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={wardrobe.filters}
        setFilters={wardrobe.setFilters}
        availableColors={wardrobe.filterOptions?.colors}
        availablePatterns={wardrobe.filterOptions?.patterns}
        availableTags={wardrobe.filterOptions?.tags}
        // Like the web: pattern for clothes only (footwear has none),
        // subtypes from the type chips and no temperature (only outfits
        // have one).
        showPatterns={!wardrobe.isFootwear}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
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
    backgroundColor: colors.fieldBackground,
    boxShadow: `inset 0px 1px 0px ${colors.lightEdge}`,
    alignItems: "center",
    justifyContent: "center",
  },
  // The same gutter and gaps as the outfit cards.
  list: {
    paddingHorizontal: space.gutter,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  column: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
});
