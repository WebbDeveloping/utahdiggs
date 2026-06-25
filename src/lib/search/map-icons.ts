import L from "leaflet";
import { formatShortPrice } from "@/lib/search/format";

export function createPriceIcon(price: number | null, highlighted: boolean) {
  const label = formatShortPrice(price);
  return L.divIcon({
    className: "",
    html: `<div style="
      background: ${highlighted ? "#0f5132" : "#ffffff"};
      color: ${highlighted ? "#ffffff" : "#13211c"};
      border: 2px solid ${highlighted ? "#0f5132" : "#c5d4ce"};
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(19,33,28,0.18);
      white-space: nowrap;
      transform: translate(-50%, -100%);
    ">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
