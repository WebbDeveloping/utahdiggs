import type { SearchFilters, SearchSort } from "@/types/public-listing";

const SORT_VALUES: SearchSort[] = [
  "date-desc",
  "date-asc",
  "price-desc",
  "price-asc",
  "size-desc",
  "size-asc",
  "beds-desc",
  "beds-asc",
  "baths-desc",
  "baths-asc",
  "year-desc",
  "year-asc",
];

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): SearchFilters {
  const get = (key: string) => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const sort = get("sort");
  const parsedSort = SORT_VALUES.includes(sort as SearchSort)
    ? (sort as SearchSort)
    : "date-desc";

  return {
    text: get("text"),
    bbox: get("bbox"),
    minPrice: get("minPrice"),
    maxPrice: get("maxPrice"),
    minBeds: get("minBeds"),
    minBaths: get("minBaths"),
    zip: get("zip"),
    state: get("state"),
    neighborhood: get("neighborhood"),
    subdivision: get("subdivision"),
    keyword: get("keyword"),
    mlsNumber: get("mlsNumber"),
    hasPool: get("hasPool"),
    sort: parsedSort,
    page: get("page"),
    limit: get("limit"),
  };
}

export function buildSearchQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "date-desc", label: "Date Added - New to Old" },
  { value: "date-asc", label: "Date Added - Old to New" },
  { value: "price-desc", label: "Price - High to Low" },
  { value: "price-asc", label: "Price - Low to High" },
  { value: "size-desc", label: "Size - High to Low" },
  { value: "size-asc", label: "Size - Low to High" },
  { value: "beds-desc", label: "Beds - High to Low" },
  { value: "beds-asc", label: "Beds - Low to High" },
  { value: "baths-desc", label: "Baths - High to Low" },
  { value: "baths-asc", label: "Baths - Low to High" },
  { value: "year-desc", label: "Year Built - New to Old" },
  { value: "year-asc", label: "Year Built - Old to New" },
];

export const PUBLIC_LISTING_STATUSES = ["ACTIVE", "UNDER_CONTRACT", "PENDING"] as const;
