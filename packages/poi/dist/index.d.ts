import type { RemarkableCity } from "@tripweaver/shared";
export declare const remarkableCities: RemarkableCity[];
export declare function getRemarkableCity(cityName: string): RemarkableCity | null;
export declare function getRemarkableSights(cityName: string): import("@tripweaver/shared").RemarkableSight[];
export declare function getSignatureFoods(cityName: string): string[];
