import remarkableData from "./remarkable.json";
import type { RemarkableCity } from "@tripweaver/shared";

export const remarkableCities: RemarkableCity[] = remarkableData;

export function getRemarkableCity(cityName: string): RemarkableCity | null {
  const city = remarkableCities.find(
    (c) => c.city.toLowerCase() === cityName.toLowerCase()
  );
  return city || null;
}

export function getRemarkableSights(cityName: string) {
  const city = getRemarkableCity(cityName);
  return city?.sights || [];
}

export function getSignatureFoods(cityName: string) {
  const city = getRemarkableCity(cityName);
  return city?.signatureFoods || [];
}
