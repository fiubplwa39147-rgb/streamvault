import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, ThumbsUp, ChevronDown, Star, Clock, Eye } from "lucide-react";
import { Video } from "../types";
import { formatViews } from "../data/demoData";

interface VideoCardProps {
  video: Video;
  size?: "sm" | "md" | "lg";
}

export default function VideoCard({ video, size = "md" }: VideoCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${video.id}`);
  };

  const cardSizes = {
    sm: "w-36 sm:w-44",
    md: "w-44 sm:w-52 md:w-56",
    lg: "w-52 sm:w-64 md:w-72",
  };

  return (
    <div
      className={`${cardSizes[size]} shrink-0 group cursor-pointer`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/watch/${video.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative rounded-md overflow-hidden aspect-video bg-gray-800">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
        )}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            hovered ? "scale-110 brightness-75" : "scale-100 brightness-90"
          } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Rating Badge */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-medium text-gray-300">
          {video.rating}
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 right-2 bg-red-600/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-medium text-white capitalize">
          {video.type}
        </div>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 flex flex-col justify-end p-2 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <button
              onClick={handlePlay}
              className="flex items-center justify-center w-8 h-8 bg-white hover:bg-gray-200 rounded-full transition-colors"
            >
              <Play className="w-4 h-4 text-black fill-black" />
            </button>
            <button className="flex items-center justify-center w-7 h-7 bg-black/60 hover:bg-black/80 border border-gray-500 rounded-full transition-colors">
              <Plus className="w-3.5 h-3.5 text-white" />
            </button>
            <button className="flex items-center justify-center w-7 h-7 bg-black/60 hover:bg-black/80 border border-gray-500 rounded-full transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/watch/${video.id}`); }}
              className="flex items-center justify-center w-7 h-7 bg-black/60 hover:bg-black/80 border border-gray-500 rounded-full transition-colors ml-auto"
            >
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-400 font-semibold flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {video.imdbRating}
            </span>
            <span className="text-gray-300">{video.year}</span>
            <span className="text-gray-300 flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {formatViews(video.views)}
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <h3 className="text-white text-sm font-medium truncate group-hover:text-gray-200 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-gray-400 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration}
          </span>
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-400 text-xs">{video.category}</span>
        </div>
      </div>
    </div>
  );
}
