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
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAccumulatedPages } from "@core/hooks/useAccumulatedPages.js";
import { useWardrobePage } from "@core/hooks/useWardrobePage.js";

import {
  colors,
  fontSizes,
  fontWeights,
  radius,
  shadows,
  spacing,
} from "../../theme/tokens";
import { FilterSheet } from "../../components/filters/FilterSheet";
import {
  Button,
  EmptyState,
  Message,
  TextField,
} from "../../components/ui";
import {
  handOverItem,
  takeWardrobeChanged,
} from "../../components/wardrobe/itemHandoff";
import { Atmosphere } from "../../components/soft";
import { ItemTile } from "../../components/wardrobe/ItemTile";
import { TypeFilter } from "../../components/wardrobe/TypeFilter";

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            Wardrobe
            {wardrobe.count ? (
              <Text style={styles.count}> ({wardrobe.count})</Text>
            ) : null}
          </Text>

          <Pressable
            onPress={addItem}
            accessibilityRole="button"
            accessibilityLabel="Add item"
            hitSlop={10}
            style={styles.addButton}
          >
            <Feather name="plus" size={22} color={colors.main} />
          </Pressable>
        </View>

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
    fontFamily: fontWeights.light,
    letterSpacing: -0.3,
    color: colors.main,
  },
  count: {
    fontSize: fontSizes.body,
    fontFamily: fontWeights.regular,
    color: colors.secondary,
  },
  // A white bubble, like the Today buttons.
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    boxShadow: shadows.soft,
    alignItems: "center",
    justifyContent: "center",
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
    flexGrow: 1,
  },
  column: {
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  spinner: {
    marginVertical: spacing.xl,
  },
});
