export function getTrips() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem('btp_trips');
  return raw ? JSON.parse(raw) : [];
}

export function saveTrips(trips) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('btp_trips', JSON.stringify(trips));
}

export function createTrip(trip) {
  const trips = getTrips();
  const withId = { ...trip, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  trips.unshift(withId);
  saveTrips(trips);
  return withId;
}

export function getTrip(id) {
  return getTrips().find((t) => t.id === id) || null;
}

export function updateTrip(id, updates) {
  const trips = getTrips();
  const idx = trips.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  trips[idx] = { ...trips[idx], ...updates, updatedAt: new Date().toISOString() };
  saveTrips(trips);
  return trips[idx];
}



