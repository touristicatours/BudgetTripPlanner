import type { HotelOffer } from '../types';

export async function searchHotels(
  destination: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<HotelOffer[]> {
  // TODO: Integrate with RateHawk API or other hotel provider
  // For now, return empty array
  return [];
}

export async function getHotelOffers(
  destination: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<HotelOffer[]> {
  // TODO: Implement real hotel search
  // This will be replaced with actual API calls to RateHawk, Booking.com, etc.
  return [];
}
