import type { SearchFilters } from "@/types/public-listing";

const STORAGE_KEY = "glide-saved-searches";

export type SavedSearch = {
  id: string;
  label: string;
  filters: SearchFilters;
  savedAt: string;
};

function readStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedSearch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(searches: SavedSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export function getSavedSearches(): SavedSearch[] {
  return readStorage();
}

export function saveSearch(filters: SearchFilters, label?: string): SavedSearch {
  const searches = readStorage();
  const id = crypto.randomUUID();
  const saved: SavedSearch = {
    id,
    label: label ?? filters.text ?? "Saved search",
    filters,
    savedAt: new Date().toISOString(),
  };
  writeStorage([saved, ...searches]);
  return saved;
}

export function removeSavedSearch(id: string) {
  const searches = readStorage().filter((search) => search.id !== id);
  writeStorage(searches);
}

const FAVORITES_KEY = "glide-favorite-listings";

export function getFavoriteListingIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteListing(id: string): boolean {
  const favorites = new Set(getFavoriteListingIds());
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  return favorites.has(id);
}

export function isFavoriteListing(id: string): boolean {
  return getFavoriteListingIds().includes(id);
}
