"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemarkableCitySchema = exports.RemarkableSightSchema = exports.OfferSchema = exports.ItinerarySchema = exports.DaySchema = exports.DayItemSchema = exports.SearchParamsSchema = exports.TripPreferencesSchema = void 0;
const zod_1 = require("zod");
exports.TripPreferencesSchema = zod_1.z.object({
    destination: zod_1.z.string().min(1),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    travelers: zod_1.z.number().int().min(1).max(10),
    currency: zod_1.z.string().length(3),
    budgetTotal: zod_1.z.number().int().min(1),
    pace: zod_1.z.enum(["relaxed", "moderate", "fast"]),
    interests: zod_1.z.array(zod_1.z.string()),
    dietary: zod_1.z.array(zod_1.z.string()),
    mustSee: zod_1.z.array(zod_1.z.string()),
});
exports.SearchParamsSchema = zod_1.z.object({
    origin: zod_1.z.string().optional(),
    destination: zod_1.z.string().min(1),
    dates: zod_1.z.object({
        start: zod_1.z.string(),
        end: zod_1.z.string(),
    }).optional(),
    pax: zod_1.z.number().int().min(1).optional(),
    budget: zod_1.z.number().int().min(1).optional(),
    area: zod_1.z.string().optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    date: zod_1.z.string().optional(),
});
exports.DayItemSchema = zod_1.z.object({
    time: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    title: zod_1.z.string().min(1),
    category: zod_1.z.enum(["flight", "hotel", "activity", "sightseeing", "food", "transport", "rest"]),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    durationMin: zod_1.z.number().int().min(1).optional(),
    estCost: zod_1.z.number().int().min(0),
    notes: zod_1.z.string(),
    booking: zod_1.z.object({
        type: zod_1.z.enum(["flight", "hotel", "tour", "ticket", "none"]),
        operator: zod_1.z.string().nullable(),
        url: zod_1.z.string().url().nullable(),
    }),
});
exports.DaySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    summary: zod_1.z.string(),
    items: zod_1.z.array(exports.DayItemSchema),
    subtotal: zod_1.z.number().int().min(0),
});
exports.ItinerarySchema = zod_1.z.object({
    currency: zod_1.z.string().length(3),
    estimatedTotal: zod_1.z.number().int().min(0),
    days: zod_1.z.array(exports.DaySchema),
});
exports.OfferSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    price: zod_1.z.number().int().min(0),
    currency: zod_1.z.string().length(3),
    supplier: zod_1.z.enum(["kiwi", "booking", "airbnb", "gyg"]),
    url: zod_1.z.string().url().optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
    startAt: zod_1.z.string().optional(),
    endAt: zod_1.z.string().optional(),
    extra: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.RemarkableSightSchema = zod_1.z.object({
    title: zod_1.z.string(),
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
    tags: zod_1.z.array(zod_1.z.string()),
    estCost: zod_1.z.number().int().min(0),
    open: zod_1.z.string().optional(),
    close: zod_1.z.string().optional(),
    closed: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.RemarkableCitySchema = zod_1.z.object({
    city: zod_1.z.string(),
    country: zod_1.z.string(),
    sights: zod_1.z.array(exports.RemarkableSightSchema),
    signatureFoods: zod_1.z.array(zod_1.z.string()),
});
