import { z } from "zod";
export declare const TripPreferencesSchema: z.ZodObject<{
    destination: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodString;
    travelers: z.ZodNumber;
    currency: z.ZodString;
    budgetTotal: z.ZodNumber;
    pace: z.ZodEnum<["relaxed", "moderate", "fast"]>;
    interests: z.ZodArray<z.ZodString, "many">;
    dietary: z.ZodArray<z.ZodString, "many">;
    mustSee: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    currency: string;
    budgetTotal: number;
    pace: "relaxed" | "moderate" | "fast";
    interests: string[];
    dietary: string[];
    mustSee: string[];
}, {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: number;
    currency: string;
    budgetTotal: number;
    pace: "relaxed" | "moderate" | "fast";
    interests: string[];
    dietary: string[];
    mustSee: string[];
}>;
export declare const SearchParamsSchema: z.ZodObject<{
    origin: z.ZodOptional<z.ZodString>;
    destination: z.ZodString;
    dates: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    pax: z.ZodOptional<z.ZodNumber>;
    budget: z.ZodOptional<z.ZodNumber>;
    area: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    destination: string;
    date?: string | undefined;
    origin?: string | undefined;
    dates?: {
        start: string;
        end: string;
    } | undefined;
    pax?: number | undefined;
    budget?: number | undefined;
    area?: string | undefined;
    categories?: string[] | undefined;
}, {
    destination: string;
    date?: string | undefined;
    origin?: string | undefined;
    dates?: {
        start: string;
        end: string;
    } | undefined;
    pax?: number | undefined;
    budget?: number | undefined;
    area?: string | undefined;
    categories?: string[] | undefined;
}>;
export declare const DayItemSchema: z.ZodObject<{
    time: z.ZodString;
    title: z.ZodString;
    category: z.ZodEnum<["flight", "hotel", "activity", "sightseeing", "food", "transport", "rest"]>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    durationMin: z.ZodOptional<z.ZodNumber>;
    estCost: z.ZodNumber;
    notes: z.ZodString;
    booking: z.ZodObject<{
        type: z.ZodEnum<["flight", "hotel", "tour", "ticket", "none"]>;
        operator: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "flight" | "hotel" | "tour" | "ticket" | "none";
        operator: string | null;
        url: string | null;
    }, {
        type: "flight" | "hotel" | "tour" | "ticket" | "none";
        operator: string | null;
        url: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    booking: {
        type: "flight" | "hotel" | "tour" | "ticket" | "none";
        operator: string | null;
        url: string | null;
    };
    time: string;
    title: string;
    category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
    estCost: number;
    notes: string;
    lat?: number | undefined;
    lng?: number | undefined;
    durationMin?: number | undefined;
}, {
    booking: {
        type: "flight" | "hotel" | "tour" | "ticket" | "none";
        operator: string | null;
        url: string | null;
    };
    time: string;
    title: string;
    category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
    estCost: number;
    notes: string;
    lat?: number | undefined;
    lng?: number | undefined;
    durationMin?: number | undefined;
}>;
export declare const DaySchema: z.ZodObject<{
    date: z.ZodString;
    summary: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        time: z.ZodString;
        title: z.ZodString;
        category: z.ZodEnum<["flight", "hotel", "activity", "sightseeing", "food", "transport", "rest"]>;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        durationMin: z.ZodOptional<z.ZodNumber>;
        estCost: z.ZodNumber;
        notes: z.ZodString;
        booking: z.ZodObject<{
            type: z.ZodEnum<["flight", "hotel", "tour", "ticket", "none"]>;
            operator: z.ZodNullable<z.ZodString>;
            url: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "flight" | "hotel" | "tour" | "ticket" | "none";
            operator: string | null;
            url: string | null;
        }, {
            type: "flight" | "hotel" | "tour" | "ticket" | "none";
            operator: string | null;
            url: string | null;
        }>;
    }, "strip", z.ZodTypeAny, {
        booking: {
            type: "flight" | "hotel" | "tour" | "ticket" | "none";
            operator: string | null;
            url: string | null;
        };
        time: string;
        title: string;
        category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
        estCost: number;
        notes: string;
        lat?: number | undefined;
        lng?: number | undefined;
        durationMin?: number | undefined;
    }, {
        booking: {
            type: "flight" | "hotel" | "tour" | "ticket" | "none";
            operator: string | null;
            url: string | null;
        };
        time: string;
        title: string;
        category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
        estCost: number;
        notes: string;
        lat?: number | undefined;
        lng?: number | undefined;
        durationMin?: number | undefined;
    }>, "many">;
    subtotal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    date: string;
    summary: string;
    items: {
        booking: {
            type: "flight" | "hotel" | "tour" | "ticket" | "none";
            operator: string | null;
            url: string | null;
        };
        time: string;
        title: string;
        category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
        estCost: number;
        notes: string;
        lat?: number | undefined;
        lng?: number | undefined;
        durationMin?: number | undefined;
    }[];
    subtotal: number;
}, {
    date: string;
    summary: string;
    items: {
        booking: {
            type: "flight" | "hotel" | "tour" | "ticket" | "none";
            operator: string | null;
            url: string | null;
        };
        time: string;
        title: string;
        category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
        estCost: number;
        notes: string;
        lat?: number | undefined;
        lng?: number | undefined;
        durationMin?: number | undefined;
    }[];
    subtotal: number;
}>;
export declare const ItinerarySchema: z.ZodObject<{
    currency: z.ZodString;
    estimatedTotal: z.ZodNumber;
    days: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        summary: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            time: z.ZodString;
            title: z.ZodString;
            category: z.ZodEnum<["flight", "hotel", "activity", "sightseeing", "food", "transport", "rest"]>;
            lat: z.ZodOptional<z.ZodNumber>;
            lng: z.ZodOptional<z.ZodNumber>;
            durationMin: z.ZodOptional<z.ZodNumber>;
            estCost: z.ZodNumber;
            notes: z.ZodString;
            booking: z.ZodObject<{
                type: z.ZodEnum<["flight", "hotel", "tour", "ticket", "none"]>;
                operator: z.ZodNullable<z.ZodString>;
                url: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            }, {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            }>;
        }, "strip", z.ZodTypeAny, {
            booking: {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            };
            time: string;
            title: string;
            category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
            estCost: number;
            notes: string;
            lat?: number | undefined;
            lng?: number | undefined;
            durationMin?: number | undefined;
        }, {
            booking: {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            };
            time: string;
            title: string;
            category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
            estCost: number;
            notes: string;
            lat?: number | undefined;
            lng?: number | undefined;
            durationMin?: number | undefined;
        }>, "many">;
        subtotal: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        date: string;
        summary: string;
        items: {
            booking: {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            };
            time: string;
            title: string;
            category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
            estCost: number;
            notes: string;
            lat?: number | undefined;
            lng?: number | undefined;
            durationMin?: number | undefined;
        }[];
        subtotal: number;
    }, {
        date: string;
        summary: string;
        items: {
            booking: {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            };
            time: string;
            title: string;
            category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
            estCost: number;
            notes: string;
            lat?: number | undefined;
            lng?: number | undefined;
            durationMin?: number | undefined;
        }[];
        subtotal: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    currency: string;
    estimatedTotal: number;
    days: {
        date: string;
        summary: string;
        items: {
            booking: {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            };
            time: string;
            title: string;
            category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
            estCost: number;
            notes: string;
            lat?: number | undefined;
            lng?: number | undefined;
            durationMin?: number | undefined;
        }[];
        subtotal: number;
    }[];
}, {
    currency: string;
    estimatedTotal: number;
    days: {
        date: string;
        summary: string;
        items: {
            booking: {
                type: "flight" | "hotel" | "tour" | "ticket" | "none";
                operator: string | null;
                url: string | null;
            };
            time: string;
            title: string;
            category: "flight" | "hotel" | "activity" | "sightseeing" | "food" | "transport" | "rest";
            estCost: number;
            notes: string;
            lat?: number | undefined;
            lng?: number | undefined;
            durationMin?: number | undefined;
        }[];
        subtotal: number;
    }[];
}>;
export declare const OfferSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    price: z.ZodNumber;
    currency: z.ZodString;
    supplier: z.ZodEnum<["kiwi", "booking", "airbnb", "gyg"]>;
    url: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    startAt: z.ZodOptional<z.ZodString>;
    endAt: z.ZodOptional<z.ZodString>;
    extra: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    title: string;
    id: string;
    price: number;
    supplier: "kiwi" | "booking" | "airbnb" | "gyg";
    lat?: number | undefined;
    lng?: number | undefined;
    url?: string | undefined;
    startAt?: string | undefined;
    endAt?: string | undefined;
    extra?: Record<string, any> | undefined;
}, {
    currency: string;
    title: string;
    id: string;
    price: number;
    supplier: "kiwi" | "booking" | "airbnb" | "gyg";
    lat?: number | undefined;
    lng?: number | undefined;
    url?: string | undefined;
    startAt?: string | undefined;
    endAt?: string | undefined;
    extra?: Record<string, any> | undefined;
}>;
export declare const RemarkableSightSchema: z.ZodObject<{
    title: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    tags: z.ZodArray<z.ZodString, "many">;
    estCost: z.ZodNumber;
    open: z.ZodOptional<z.ZodString>;
    close: z.ZodOptional<z.ZodString>;
    closed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    lat: number;
    lng: number;
    estCost: number;
    tags: string[];
    open?: string | undefined;
    close?: string | undefined;
    closed?: string[] | undefined;
}, {
    title: string;
    lat: number;
    lng: number;
    estCost: number;
    tags: string[];
    open?: string | undefined;
    close?: string | undefined;
    closed?: string[] | undefined;
}>;
export declare const RemarkableCitySchema: z.ZodObject<{
    city: z.ZodString;
    country: z.ZodString;
    sights: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        tags: z.ZodArray<z.ZodString, "many">;
        estCost: z.ZodNumber;
        open: z.ZodOptional<z.ZodString>;
        close: z.ZodOptional<z.ZodString>;
        closed: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        lat: number;
        lng: number;
        estCost: number;
        tags: string[];
        open?: string | undefined;
        close?: string | undefined;
        closed?: string[] | undefined;
    }, {
        title: string;
        lat: number;
        lng: number;
        estCost: number;
        tags: string[];
        open?: string | undefined;
        close?: string | undefined;
        closed?: string[] | undefined;
    }>, "many">;
    signatureFoods: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    city: string;
    country: string;
    sights: {
        title: string;
        lat: number;
        lng: number;
        estCost: number;
        tags: string[];
        open?: string | undefined;
        close?: string | undefined;
        closed?: string[] | undefined;
    }[];
    signatureFoods: string[];
}, {
    city: string;
    country: string;
    sights: {
        title: string;
        lat: number;
        lng: number;
        estCost: number;
        tags: string[];
        open?: string | undefined;
        close?: string | undefined;
        closed?: string[] | undefined;
    }[];
    signatureFoods: string[];
}>;
