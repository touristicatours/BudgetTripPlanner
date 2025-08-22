import type { ActivityOffer } from '../types';

export async function searchActivities(
  destination: string,
  startDate: string,
  endDate: string,
  interests: string[]
): Promise<ActivityOffer[]> {
  // TODO: Integrate with GetYourGuide API or other activity provider
  // For now, return empty array
  return [];
}

export async function getActivityOffers(
  destination: string,
  startDate: string,
  endDate: string,
  interests: string[]
): Promise<ActivityOffer[]> {
  // TODO: Implement real activity search
  // This will be replaced with actual API calls to GetYourGuide, Viator, etc.
  return [];
}
