"use client";

export type SavedItem = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  tags?: string[];
};

const SAVED_KEY = "tw-saved-items";
const PREFS_KEY = "tw-user-prefs";
const COMMUNITY_KEY = "tw-community-posts";

export function getSaved(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
}

export function saveItem(item: SavedItem) {
  const all = getSaved();
  if (!all.find(i => i.id === item.id)) {
    localStorage.setItem(SAVED_KEY, JSON.stringify([item, ...all]));
  }
}

export function removeSaved(id: string) {
  const all = getSaved().filter(i => i.id !== id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(all));
}

export type UserPrefs = Record<string, number>; // e.g., { beach: 3, foodie: 5 }

export function getPrefs(): UserPrefs {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
}

export function bumpPref(tag: string, by: number = 1) {
  const prefs = getPrefs();
  prefs[tag.toLowerCase()] = (prefs[tag.toLowerCase()] || 0) + by;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function topPrefs(n: number = 3): string[] {
  const p = getPrefs();
  return Object.entries(p).sort((a,b) => b[1]-a[1]).slice(0,n).map(([k]) => k);
}

// Community posts (client-only demo)
export type CommunityPost = {
  id: string;
  title: string;
  imageDataUrl: string;
  author?: string;
  tags?: string[];
  createdAt?: string;
};

export function getCommunityPosts(): CommunityPost[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(COMMUNITY_KEY) || '[]'); } catch { return []; }
}

export function addCommunityPost(post: CommunityPost) {
  const all = getCommunityPosts();
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify([post, ...all]));
}


