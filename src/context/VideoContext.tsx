import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  increment,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Video } from "../types";
import { DEMO_VIDEOS } from "../data/demoData";

interface VideoContextType {
  videos: Video[];
  isLoading: boolean;
  addVideo: (video: Omit<Video, "id" | "views" | "createdAt">) => Promise<void>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  getVideoById: (id: string) => Video | undefined;
  getVideosByCategory: (category: string) => Video[];
  getTrendingVideos: () => Video[];
  getFeaturedVideo: () => Video | undefined;
  searchVideos: (query: string) => Video[];
}

const VideoContext = createContext<VideoContextType>({} as VideoContextType);

export const useVideos = () => useContext(VideoContext);

export function VideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      
      // If database is empty, load demo data
      if (videoData.length === 0) {
        setVideos(DEMO_VIDEOS);
      } else {
        setVideos(videoData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error, falling back to demo data:", error);
      // Fallback to demo data on error (e.g., permission denied or missing index)
      setVideos(DEMO_VIDEOS);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addVideo = async (video: Omit<Video, "id" | "views" | "createdAt">) => {
    await addDoc(collection(db, "videos"), {
      ...video,
      views: 0,
      createdAt: Date.now(),
    });
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    const videoRef = doc(db, "videos", id);
    await updateDoc(videoRef, updates);
  };

  const deleteVideo = async (id: string) => {
    await deleteDoc(doc(db, "videos", id));
  };

  const incrementViews = async (id: string) => {
    const videoRef = doc(db, "videos", id);
    await updateDoc(videoRef, {
      views: increment(1)
    });
  };

  const getVideoById = (id: string) => videos.find((v) => v.id === id);

  const getVideosByCategory = (category: string) => {
    if (category === "all" || category === "All") return videos;
    return videos.filter(
      (v) =>
        v.category.toLowerCase() === category.toLowerCase() ||
        v.genre.some((g) => g.toLowerCase() === category.toLowerCase())
    );
  };

  const getTrendingVideos = () =>
    videos.filter((v) => v.isTrending).sort((a, b) => b.views - a.views);

  const getFeaturedVideo = () =>
    videos.find((v) => v.isFeatured) || videos[0];

  const searchVideos = (query: string) => {
    const q = query.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.genre.some((g) => g.toLowerCase().includes(q))
    );
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        isLoading,
        addVideo,
        updateVideo,
        deleteVideo,
        incrementViews,
        getVideoById,
        getVideosByCategory,
        getTrendingVideos,
        getFeaturedVideo,
        searchVideos,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}
