"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remarkableCities = void 0;
exports.getRemarkableCity = getRemarkableCity;
exports.getRemarkableSights = getRemarkableSights;
exports.getSignatureFoods = getSignatureFoods;
const remarkable_json_1 = __importDefault(require("./remarkable.json"));
exports.remarkableCities = remarkable_json_1.default;
function getRemarkableCity(cityName) {
    const city = exports.remarkableCities.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
    return city || null;
}
function getRemarkableSights(cityName) {
    const city = getRemarkableCity(cityName);
    return city?.sights || [];
}
function getSignatureFoods(cityName) {
    const city = getRemarkableCity(cityName);
    return city?.signatureFoods || [];
}
