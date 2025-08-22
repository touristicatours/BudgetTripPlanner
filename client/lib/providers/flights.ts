import type { FlightOffer } from '../types';

export async function searchFlights(
  origin: string,
  destination: string,
  startDate: string,
  endDate: string,
  travelers: number
): Promise<FlightOffer[]> {
  // TODO: Integrate with Duffel API or other flight provider
  // For now, return empty array
  return [];
}

export async function getFlightOffers(
  origin: string,
  destination: string,
  startDate: string,
  endDate: string,
  travelers: number
): Promise<FlightOffer[]> {
  // TODO: Implement real flight search
  // This will be replaced with actual API calls to Duffel, Skyscanner, etc.
  return [];
}
