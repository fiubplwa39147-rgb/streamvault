export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  genre: string[];
  year: number;
  rating: string; // e.g. "PG-13", "R", "TV-MA"
  imdbRating: number;
  duration: string; // e.g. "2h 15m"
  sources: {
    primary: string;
    backup1?: string;
    backup2?: string;
  };
  isFeatured?: boolean;
  isTrending?: boolean;
  views: number;
  createdAt: number;
  cast?: string[];
  director?: string;
  type: "movie" | "series";
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "user";
  plan: "free" | "pro";
  watchHistory: string[];
  createdAt: number;
}

export interface Analytics {
  videoId: string;
  views: number;
  watchTime: number;
  clicks: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type AdState = "pre-roll" | "banner" | "pause" | "none";
