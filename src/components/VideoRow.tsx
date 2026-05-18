import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Video } from "../types";
import VideoCard from "./VideoCard";

interface VideoRowProps {
  title: string;
  videos: Video[];
  size?: "sm" | "md" | "lg";
  emoji?: string;
}

export default function VideoRow({ title, videos, size = "md", emoji }: VideoRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (!videos.length) return null;

  return (
    <div className="py-4 group/row">
      <h2 className="text-white font-semibold text-lg sm:text-xl mb-3 px-4 sm:px-8 flex items-center gap-2">
        {emoji && <span>{emoji}</span>}
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-r from-black/80 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 bg-black/70 hover:bg-black rounded-full flex items-center justify-center border border-gray-600">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>
        )}

        {/* Video Scroll */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-8 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} size={size} />
          ))}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-full bg-gradient-to-l from-black/80 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-8 h-8 bg-black/70 hover:bg-black rounded-full flex items-center justify-center border border-gray-600">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
