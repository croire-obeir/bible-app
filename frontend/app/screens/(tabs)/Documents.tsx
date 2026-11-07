import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarScroll } from '../../../components/tab-bar-visibility';
import * as WebBrowser from 'expo-web-browser';
import AppDrawer from '../../../components/AppDrawer';
import Header from '../../../components/CustomHeader';
import {
  buildR2DocumentUrl,
  fetchDocumentManifest,
  getCachedDocumentManifest,
  getNestedFolderSegments,
  type ManifestCategory,
  type ManifestDocument,
} from '../../../api/services/documentManifestServices';





const ALL_CATEGORIES_ID = 'all';

type PdfItem = {
  id: string;
  title: string;
  categoryName: string;
  subcategory?: string;
  url: string;
};

type FolderItem = {
  id: string;
  key: string;
  name: string;
  documentCount: number;
};

function toPdfItem(
  category: ManifestCategory,
  document: ManifestDocument
): PdfItem {
  const nestedFolders = getNestedFolderSegments(document.file);

  return {
    id: document.id,
    title: document.title,
    categoryName: category.name.trim() || category.name,
    subcategory:
      nestedFolders.length > 0
        ? nestedFolders
          .map((segment) => segment.trim() || segment)
          .join(' / ')
        : undefined,
    url: buildR2DocumentUrl(document.file),
  };
}

function startsWithFolderPath(
  segments: string[],
  folderPath: string[]
): boolean {
  return folderPath.every(
    (folder, index) => segments[index] === folder
  );
}

export default function DocumentsScreen() {
  const handleTabBarScroll = useTabBarScroll();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [categories, setCategories] = useState<ManifestCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(ALL_CATEGORIES_ID);

  const [folderPath, setFolderPath] = useState<string[]>([]);

  const loadManifest = useCallback(async (isRefresh = false) => {
    setErrorMessage(null);

    // Pull-to-refresh: fetch the latest manifest directly.
    if (isRefresh) {
      setIsRefreshing(true);

      try {
        const result = await fetchDocumentManifest();

        if (result.success) {
          setCategories(result.data.categories);
        } else {
          setErrorMessage(result.error);
        }
      } catch {
        setErrorMessage(
          'Une erreur est survenue lors du chargement des documents.'
        );
      } finally {
        setIsRefreshing(false);
      }

      return;
    }

    setIsLoading(true);

    try {
      // 1. Read the local cache first.
      const cachedManifest = await getCachedDocumentManifest();

      if (cachedManifest) {
        // Display documents immediately from local storage.
        setCategories(cachedManifest.categories);
        setIsLoading(false);

        // 2. Update from R2 in the background.
        const result = await fetchDocumentManifest();

        if (result.success) {
          setCategories(result.data.categories);
        }

        return;
      }

      // 3. No cache yet: fetch from R2.
      const result = await fetchDocumentManifest();

      if (result.success) {
        setCategories(result.data.categories);
      } else {
        setErrorMessage(result.error);
      }
    } catch {
      setErrorMessage(
        'Une erreur est survenue lors du chargement des documents.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadManifest();
  }, [loadManifest]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === selectedCategoryId
      ) ?? null,
    [categories, selectedCategoryId]
  );


  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        a.name.trim().localeCompare(b.name.trim(), 'fr', {
          sensitivity: 'base',
        })
      ),
    [categories]
  );

  // Total document count across all categories.
  const totalDocumentCount = useMemo(
    () =>
      categories.reduce(
        (total, category) => total + category.documents.length,
        0
      ),
    [categories]
  );

  const hasAnyDocuments = totalDocumentCount > 0;

  // Build the folders visible at the current navigation level.
  const visibleFolders = useMemo((): FolderItem[] => {
    if (!selectedCategory) {
      return [];
    }

    const nextFolders = new Map<string, FolderItem>();

    for (const document of selectedCategory.documents) {
      const nestedFolders = getNestedFolderSegments(document.file);

      if (!startsWithFolderPath(nestedFolders, folderPath)) {
        continue;
      }

      const nextFolder = nestedFolders[folderPath.length];

      if (!nextFolder) {
        continue;
      }

      const existing = nextFolders.get(nextFolder);

      if (existing) {
        existing.documentCount += 1;
      } else {
        nextFolders.set(nextFolder, {
          id: `${selectedCategory.id}:${[
            ...folderPath,
            nextFolder,
          ].join('/')}`,
          key: nextFolder,
          name: nextFolder.trim() || nextFolder,
          documentCount: 1,
        });
      }
    }

    return Array.from(nextFolders.values());
  }, [folderPath, selectedCategory]);

  // Show all documents for "Tout".
  // When a category is selected, show only documents at the
  // current folder level.
  const visibleDocuments = useMemo((): PdfItem[] => {
    if (!selectedCategory) {
      return categories.flatMap((category) =>
        category.documents.map((document) =>
          toPdfItem(category, document)
        )
      );
    }

    return selectedCategory.documents
      .filter((document) => {
        const nestedFolders = getNestedFolderSegments(document.file);

        return (
          nestedFolders.length === folderPath.length &&
          startsWithFolderPath(nestedFolders, folderPath)
        );
      })
      .map((document) => toPdfItem(selectedCategory, document));
  }, [categories, folderPath, selectedCategory]);

  const openPdf = useCallback(async (item: PdfItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir le PDF.");
    }
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setFolderPath([]);
  }, []);

  const handleOpenFolder = useCallback((folderName: string) => {
    setFolderPath((current) => [...current, folderName]);
  }, []);

  const handleNavigateToFolder = useCallback((depth: number) => {
    setFolderPath((current) => current.slice(0, depth));
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color="#0a2d55" />
          <Text style={styles.stateText}>
            Chargement des documents...
          </Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.centeredState}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#8a99ad"
          />
          <Text style={styles.stateTitle}>
            Impossible de charger les documents
          </Text>
          <Text style={styles.stateText}>{errorMessage}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadManifest()}
            activeOpacity={0.85}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasAnyDocuments) {
      return (
        <View style={styles.centeredState}>
          <Ionicons
            name="documents-outline"
            size={42}
            color="#8a99ad"
          />
          <Text style={styles.stateTitle}>
            Aucun document disponible
          </Text>
          <Text style={styles.stateText}>
            La bibliothèque ne contient pas encore de fichiers.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleTabBarScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadManifest(true)}
            tintColor="#0a2d55"
          />
        }
      >
        <Text style={styles.pageTitle}>
          Bibliothèque de{'\n'}Documents
        </Text>

        <Text style={styles.intro}>
          Explorez notre collection de ressources, études et ouvrages
          pour approfondir votre foi.
        </Text>

        {/* Category filters with document counts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <TouchableOpacity
            style={[
              styles.filter,
              selectedCategoryId === ALL_CATEGORIES_ID &&
              styles.activeFilter,
            ]}
            onPress={() => handleSelectCategory(ALL_CATEGORIES_ID)}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategoryId === ALL_CATEGORIES_ID &&
                styles.activeFilterText,
              ]}
            >
              Tout ({totalDocumentCount})
            </Text>
          </TouchableOpacity>

          {sortedCategories.map((category) => {
            const isActive = selectedCategoryId === category.id;
            const categoryName =
              category.name.trim() || category.name;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filter,
                  isActive && styles.activeFilter,
                ]}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                  ]}
                >
                  {categoryName} ({category.documents.length})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Breadcrumb navigation */}
        <View style={styles.backRow}>
          <TouchableOpacity
            onPress={() => handleSelectCategory(ALL_CATEGORIES_ID)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.backText,
                !selectedCategory && folderPath.length === 0
                  ? { color: '#8a99ad' }
                  : null,
              ]}
            >
              Tout
            </Text>
          </TouchableOpacity>

          {selectedCategory && (
            <>
              <Ionicons
                name="chevron-forward"
                size={13}
                color="#8a99ad"
              />

              <TouchableOpacity
                onPress={() => handleNavigateToFolder(0)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.backText,
                    folderPath.length === 0
                      ? { color: '#8a99ad' }
                      : null,
                  ]}
                  numberOfLines={1}
                >
                  {selectedCategory.name.trim() ||
                    selectedCategory.name}
                </Text>
              </TouchableOpacity>

              {folderPath.map((folder, index) => {
                const isCurrentFolder =
                  index === folderPath.length - 1;

                return (
                  <React.Fragment key={`${folder}-${index}`}>
                    <Ionicons
                      name="chevron-forward"
                      size={13}
                      color="#8a99ad"
                    />

                    <TouchableOpacity
                      onPress={() =>
                        handleNavigateToFolder(index + 1)
                      }
                      activeOpacity={0.8}
                      disabled={isCurrentFolder}
                    >
                      <Text
                        style={[
                          styles.backText,
                          isCurrentFolder
                            ? { color: '#8a99ad' }
                            : null,
                        ]}
                        numberOfLines={1}
                      >
                        {folder.trim() || folder}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </>
          )}
        </View>

        {/* Nested folders */}
        {visibleFolders.map((folder) => (
          <TouchableOpacity
            key={folder.id}
            style={styles.itemCard}
            activeOpacity={0.85}
            onPress={() => handleOpenFolder(folder.key)}
          >
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="folder-outline"
                  size={22}
                  color="#AA8418"
                />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.category}>DOSSIER</Text>
                <Text style={styles.itemTitle}>{folder.name}</Text>
                <Text style={styles.itemMeta}>
                  {folder.documentCount}{' '}
                  document{folder.documentCount > 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <View style={styles.cardArrow}>
              <Ionicons
                name="chevron-forward"
                size={15}
                color="#8da0ba"
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Documents */}
        {visibleDocuments.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            activeOpacity={0.85}
            onPress={() => void openPdf(item)}
          >
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#AA8418"
                />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.category}>
                  {item.categoryName.toUpperCase()}
                </Text>

                <Text style={styles.itemTitle}>{item.title}</Text>

                {item.subcategory ? (
                  <Text style={styles.itemMeta} numberOfLines={2}>
                    {item.subcategory}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.cardArrow}>
              <Ionicons
                name="chevron-forward"
                size={15}
                color="#8da0ba"
              />
            </View>
          </TouchableOpacity>
        ))}

        {visibleFolders.length === 0 &&
          visibleDocuments.length === 0 ? (
          <View style={styles.emptyList}>
            <Text style={styles.stateText}>
              Ce dossier ne contient pas encore de documents.
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <Header title="Documents" />
        {renderContent()}
      </ImageBackground>

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bg: { flex: 1 },
  header: { height: 100, backgroundColor: '#c7ba9d', paddingHorizontal: 14, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#233A59', fontFamily: 'serif', fontStyle: 'normal', fontSize: 25, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 12, paddingTop: 13, paddingBottom: 160 },
  pageTitle: { textAlign: 'center', fontFamily: 'serif', fontSize: 30, lineHeight: 36, color: '#0a2d55', marginTop: 18, marginBottom: 10 },
  intro: { textAlign: 'center', color: '#687080', fontSize: 13, lineHeight: 19, marginBottom: 16 },
  searchBox: { height: 46, borderRadius: 23, backgroundColor: '#e9e9ea', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 },
  searchInput: { flex: 1, fontSize: 13 },
  filters: { flexDirection: 'row', gap: 9, paddingVertical: 15 },
  filter: { paddingHorizontal: 17, height: 32, borderRadius: 16, justifyContent: 'center', backgroundColor: '#e5e5e6' },
  activeFilter: { backgroundColor: '#092d6b' },
  filterText: { fontSize: 11, color: '#666b76' },
  activeFilterText: { color: '#fff' },
  itemCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#edf0f4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
  left: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1, paddingRight: 8 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e7edf7', justifyContent: 'center', alignItems: 'center' },
  textWrap: { flex: 1 },
  category: { color: '#9c7a1a', fontSize: 10, fontWeight: '700', marginBottom: 5 },
  itemTitle: { fontFamily: 'serif', fontSize: 17, lineHeight: 23, color: '#0a2d55' },
  itemMeta: { marginTop: 7, fontSize: 12, color: '#777', lineHeight: 18 },
  cardArrow: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#f0f3f7', alignItems: 'center', justifyContent: 'center' },
  bottomPadding: { height: 20 },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 10 },
  stateTitle: { fontFamily: 'serif', fontSize: 20, color: '#0a2d55', textAlign: 'center' },
  stateText: { fontSize: 13, color: '#687080', textAlign: 'center', lineHeight: 19 },
  retryButton: { marginTop: 8, backgroundColor: '#092d6b', borderRadius: 18, paddingHorizontal: 20, height: 36, justifyContent: 'center' },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  backText: { color: '#0a2d55', fontSize: 13, fontWeight: '600' },
  backFolder: { flex: 1, color: '#8a99ad', fontSize: 12 },
  emptyList: { paddingVertical: 24, alignItems: 'center' },
});
