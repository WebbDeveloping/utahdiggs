import {
  formatCheckboxValue,
  formatScalarValue,
  formatSchoolName,
} from "@/lib/mls-input/format-field-value";
import type { PublicListing } from "@/types/public-listing";

export type PropertyDetailItem = { label: string; value: string };
export type PropertyDetailSection = { title: string; items: PropertyDetailItem[] };

type ListingContext = Pick<PublicListing, "yearBuilt" | "listingOffice">;

type ItemConfig = {
  label: string;
  getValue: (data: Record<string, unknown>, listing: ListingContext) => string | null;
};

type SectionConfig = {
  title: string;
  items: ItemConfig[];
};

function joinValues(...parts: Array<string | null | undefined>): string | null {
  const joined = parts.filter(Boolean).join(", ");
  return joined || null;
}

function formatBasement(data: Record<string, unknown>): string | null {
  const types = formatCheckboxValue(data["q26-typea26"]);
  const finished = formatScalarValue(data.basementFinished);
  if (types && finished) return `${types} (${finished})`;
  return types ?? finished;
}

function formatStyle(data: Record<string, unknown>): string | null {
  const style = formatScalarValue(data["q51-styleof51"]);
  const levels = formatScalarValue(data.levelCount);
  if (style && levels) return `${style}, Levels: ${levels}`;
  return style ?? (levels ? `Levels: ${levels}` : null);
}

function formatParking(data: Record<string, unknown>): string | null {
  return joinValues(
    formatCheckboxValue(data["q30-typea30"]),
    data["q208-garagecapacity"]
      ? `Parking spaces: ${formatScalarValue(data["q208-garagecapacity"])}`
      : null,
    formatCheckboxValue(data["q39-typea39"]),
  );
}

function formatPool(data: Record<string, unknown>): string | null {
  if (data["q184-doesthe"] !== "Yes") return null;
  return formatCheckboxValue(data["q63-pooltype"]);
}

function formatHoa(data: Record<string, unknown>): string | null {
  const hoa = formatScalarValue(data.hoa);
  if (!hoa) return null;
  if (hoa === "Yes" && data.hoaFeeMonth) {
    return `Yes — $${formatScalarValue(data.hoaFeeMonth)}/mo`;
  }
  return hoa;
}

const SECTION_CONFIG: SectionConfig[] = [
  {
    title: "Interior",
    items: [
      {
        label: "General",
        getValue: (data) => formatCheckboxValue(data["q34-typea34"]),
      },
      {
        label: "Accessibility",
        getValue: (data) => {
          const value = formatCheckboxValue(data["q27-typea27"]);
          return value === "None" ? null : value;
        },
      },
      {
        label: "Basement",
        getValue: (data) => formatBasement(data),
      },
      {
        label: "Flooring",
        getValue: (data) => formatCheckboxValue(data["q33-flooring"]),
      },
      {
        label: "A/C",
        getValue: (data) => formatCheckboxValue(data["q31-airconditioning"]),
      },
      {
        label: "Heating",
        getValue: (data) => formatCheckboxValue(data["q96-hvac96"]),
      },
    ],
  },
  {
    title: "Exterior",
    items: [
      {
        label: "General",
        getValue: (data) => formatCheckboxValue(data["q29-typea29"]),
      },
      {
        label: "Style",
        getValue: (data) => formatStyle(data),
      },
      {
        label: "Pool",
        getValue: (data) => formatPool(data),
      },
      {
        label: "Parking",
        getValue: (data) => formatParking(data),
      },
      {
        label: "Amenities",
        getValue: (data) => {
          const value = formatCheckboxValue(data["q42-amenities"]);
          return value === "None" ? null : value;
        },
      },
    ],
  },
  {
    title: "Construction",
    items: [
      {
        label: "Roofing",
        getValue: (data) => formatCheckboxValue(data["q37-typea37"]),
      },
      {
        label: "Windows",
        getValue: (data) => formatCheckboxValue(data["q41-window-coverings"]),
      },
      {
        label: "General",
        getValue: (data) =>
          joinValues(
            formatScalarValue(data.constructionStatus),
            formatCheckboxValue(data["q32-typea32"]),
          ),
      },
    ],
  },
  {
    title: "Location",
    items: [
      {
        label: "Originating MLS",
        getValue: () => "UtahRealEstate.com",
      },
      {
        label: "School District",
        getValue: (data) => formatSchoolName(data, "School District"),
      },
      {
        label: "County",
        getValue: (data) => formatScalarValue(data.listingCounty),
      },
    ],
  },
  {
    title: "Lot",
    items: [
      {
        label: "Topography",
        getValue: (data) => formatCheckboxValue(data["q43-lot-facts"]),
      },
      {
        label: "Landscaping",
        getValue: (data) => formatCheckboxValue(data["q36-typea36"]),
      },
      {
        label: "Zoning",
        getValue: (data) =>
          joinValues(
            formatCheckboxValue(data["q38-zoning"]),
            data.taxParcelNumber
              ? `Parcel: ${formatScalarValue(data.taxParcelNumber)}`
              : null,
          ),
      },
      {
        label: "Current Use",
        getValue: (data) => formatScalarValue(data["q11-propertytype"]),
      },
      {
        label: "Animals",
        getValue: (data) => {
          const value = formatScalarValue(data["q47-animals"]);
          return value === "None" ? null : value;
        },
      },
    ],
  },
  {
    title: "Utilities",
    items: [
      {
        label: "Water",
        getValue: (data) => formatCheckboxValue(data["q44-water"]),
      },
      {
        label: "Connected Utilities",
        getValue: (data) => formatCheckboxValue(data["q35-connectedutilities"]),
      },
      {
        label: "Telecommunications",
        getValue: (data) => formatCheckboxValue(data["q45-telecommunications"]),
      },
    ],
  },
  {
    title: "Financial",
    items: [
      {
        label: "Accepted Terms",
        getValue: (data) => formatCheckboxValue(data["q40-typea40"]),
      },
      {
        label: "HOA",
        getValue: (data) => formatHoa(data),
      },
      {
        label: "Exclusions",
        getValue: (data) => formatScalarValue(data.exclusionsRemarks),
      },
    ],
  },
  {
    title: "Property",
    items: [
      {
        label: "Year Built",
        getValue: (data, listing) =>
          formatScalarValue(data.yearBuilt) ??
          (listing.yearBuilt != null ? String(listing.yearBuilt) : null),
      },
      {
        label: "Type",
        getValue: (data) => formatScalarValue(data["q11-propertytype"]),
      },
      {
        label: "Style",
        getValue: (data) => formatScalarValue(data["q51-styleof51"]),
      },
      {
        label: "Parcel #",
        getValue: (data) => formatScalarValue(data.taxParcelNumber),
      },
    ],
  },
  {
    title: "Schools",
    items: [
      {
        label: "District",
        getValue: (data) => formatSchoolName(data, "School District"),
      },
      {
        label: "Elementary",
        getValue: (data) => formatSchoolName(data, "Elementary School"),
      },
      {
        label: "Junior High",
        getValue: (data) => formatSchoolName(data, "Junior High/Middle School"),
      },
      {
        label: "High",
        getValue: (data) => formatSchoolName(data, "High School"),
      },
    ],
  },
];

export function mapIntakeToPropertyDetails(
  data: Record<string, unknown>,
  listing: ListingContext,
): PropertyDetailSection[] {
  return SECTION_CONFIG.map((section) => ({
    title: section.title,
    items: section.items
      .map((item) => {
        const value = item.getValue(data, listing);
        return value ? { label: item.label, value } : null;
      })
      .filter((item): item is PropertyDetailItem => item !== null),
  })).filter((section) => section.items.length > 0);
}
