// Type definitions for the backend

export const PACE_OPTIONS = ['relaxed', 'standard', 'intense'];
export const CATEGORY_OPTIONS = ['food', 'sightseeing', 'activity', 'transport', 'rest'];
export const BOOKING_TYPE_OPTIONS = ['flight', 'hotel', 'tour', 'ticket', 'none'];

export const validatePace = (pace) => PACE_OPTIONS.includes(pace);
export const validateCategory = (category) => CATEGORY_OPTIONS.includes(category);
export const validateBookingType = (type) => BOOKING_TYPE_OPTIONS.includes(type);
