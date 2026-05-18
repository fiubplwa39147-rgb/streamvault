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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const videoData = snapshot.docs.map(doc => {
            const data = doc.data();
            // Validate video has required fields
            if (!data.title || !data.sources?.primary) {
              console.warn(`Invalid video document ${doc.id}: missing title or primary source`);
              return null;
            }
            return {
              id: doc.id,
              ...data
            };
          }).filter((v): v is Video => v !== null);
          
          console.log(`✅ Loaded ${videoData.length} videos from Firestore`);
          setVideos(videoData);
          setError(null);
          setIsLoading(false);
        } catch (err) {
          console.error("Error processing Firestore data:", err);
          setError("Error loading videos");
          setVideos([]);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("❌ Firestore connection error:", error);
        setError(error.message);
        setVideos([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addVideo = async (video: Omit<Video, "id" | "views" | "createdAt">) => {
    try {
      // Validate video data
      if (!video.title || !video.sources.primary) {
        throw new Error("Title and primary source are required");
      }

      const docRef = await addDoc(collection(db, "videos"), {
        ...video,
        views: 0,
        createdAt: Date.now(),
      });
      console.log("✅ Video added with ID:", docRef.id);
    } catch (err) {
      console.error("Error adding video:", err);
      throw err;
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const videoRef = doc(db, "videos", id);
      await updateDoc(videoRef, updates);
      console.log("✅ Video updated:", id);
    } catch (err) {
      console.error("Error updating video:", err);
      throw err;
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      console.log("✅ Video deleted:", id);
    } catch (err) {
      console.error("Error deleting video:", err);
      throw err;
    }
  };

  const incrementViews = async (id: string) => {
    try {
      const videoRef = doc(db, "videos", id);
      await updateDoc(videoRef, {
        views: increment(1)
      });
    } catch (err) {
      console.error("Error incrementing views:", err);
    }
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
