import { useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  TextInput,
  SectionList,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getSectionListData, SectionListData } from "@/utils";
import { createTable, saveMenuItems, getMenuItems, MenuItem } from "@/database";
import { fetchData, customMenuItems } from "@/api";

function MenuScreen() {
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<SectionListData[]>([]);
  const [filteredData, setFilteredData] = useState<SectionListData[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, boolean>
  >({});
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and fetch data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);

        // Use custom menu data instead of database operations
        // since we're having issues with SQLite
        const items = customMenuItems;

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(items.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);

        // Initialize selected categories (all selected by default)
        const initialCategories: Record<string, boolean> = {};
        uniqueCategories.forEach((category) => {
          initialCategories[category] = true;
        });
        setSelectedCategories(initialCategories);

        // Transform the raw data into the format expected by SectionList
        const sectionListData = getSectionListData(items);
        setData(sectionListData);
        setFilteredData(sectionListData);
      } catch (error) {
        console.error("Error initializing app:", error);
        Alert.alert(
          "Error",
          "Failed to load menu data. Please try again later.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Filter data based on search text and selected categories
  useEffect(() => {
    if (!data.length) return;

    const filterData = () => {
      // Filter items based on search text and selected categories
      const filteredItems = customMenuItems.filter((item) => {
        const matchesSearch = item.title
          .toLowerCase()
          .includes(searchText.toLowerCase());
        const categoryIsSelected = selectedCategories[item.category];
        return matchesSearch && categoryIsSelected;
      });

      // Transform filtered items into section list format
      const filteredSections = getSectionListData(filteredItems);
      setFilteredData(filteredSections);
    };

    filterData();
  }, [searchText, selectedCategories, data]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Render a menu item
  const renderItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.menuItem}>
      <ThemedText style={styles.menuItemTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.menuItemPrice}>${item.price}</ThemedText>
    </View>
  );

  // Render a section header
  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/little-lemon-logo-grey.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.headerTitle}>Little Lemon</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F4CE14" />
          <ThemedText style={styles.loadingText}>Loading menu...</ThemedText>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#888"
            />
          </View>

          {/* Category Filters */}
          <View style={styles.categoriesContainer}>
            <ThemedText style={styles.categoriesTitle}>CATEGORIES</ThemedText>
            <View style={styles.categoriesRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategories[category]
                      ? styles.categoryButtonSelected
                      : {},
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategories[category]
                        ? styles.categoryButtonTextSelected
                        : {},
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Menu List */}
          <SectionList
            sections={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={true}
            style={styles.sectionList}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#495E57", // Little Lemon green background
  },
  header: {
    backgroundColor: "#495E57",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F4CE14", // Little Lemon yellow
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#495E57",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: "#495E57",
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#fff",
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#3A474E",
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#F4CE14",
  },
  categoryButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: "#333",
  },
  sectionList: {
    flex: 1,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    backgroundColor: "#F4CE14", // Little Lemon yellow
    padding: 10,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  menuItemTitle: {
    fontSize: 16,
    color: "#333",
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495E57", // Little Lemon green
  },
});

export default MenuScreen;
