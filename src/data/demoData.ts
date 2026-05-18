import { Video, User } from "../types";

/**
 * DEMO_VIDEOS is now empty. All videos must be added through:
 * 1. Admin Panel (/admin) - Create new videos with valid streaming sources
 * 2. Firebase Firestore - Videos will be persisted in the database
 * 
 * When videos are loaded from Firestore, they will populate the player.
 * If no videos exist in the database, an empty state will be shown.
 */
export const DEMO_VIDEOS: Video[] = [];

export const DEMO_CATEGORIES = [
  { id: "all", name: "All", icon: "🎬" },
  { id: "action", name: "Action", icon: "💥" },
  { id: "drama", name: "Drama", icon: "🎭" },
  { id: "sci-fi", name: "Sci-Fi", icon: "🚀" },
  { id: "crime", name: "Crime", icon: "🔍" },
  { id: "thriller", name: "Thriller", icon: "😱" },
  { id: "romance", name: "Romance", icon: "❤️" },
];

export const DEMO_ADMIN: User = {
  uid: "admin001",
  email: "admin@streamvault.com",
  displayName: "Admin User",
  role: "admin",
  plan: "pro",
  watchHistory: [],
  createdAt: Date.now(),
};

export const DEMO_USER: User = {
  uid: "user001",
  email: "user@streamvault.com",
  displayName: "Demo User",
  role: "user",
  plan: "free",
  watchHistory: [],
  createdAt: Date.now(),
};

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function generateToken(userId: string, videoId: string): string {
  return btoa(`${userId}:${videoId}:${Date.now()}`);
}
