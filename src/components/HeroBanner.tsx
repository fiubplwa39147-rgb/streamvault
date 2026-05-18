import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info, Star, Clock, Calendar, Volume2, VolumeX } from "lucide-react";
import { Video } from "../types";

interface HeroBannerProps {
  video: Video;
}

export default function HeroBanner({ video }: HeroBannerProps) {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-[85vh] min-h-[500px] max-h-[800px] overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 h-full flex flex-col justify-end pb-16 px-4 sm:px-8 lg:px-16 max-w-3xl transition-all duration-1000 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Featured Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-red-600 px-3 py-1 rounded text-white text-xs font-bold uppercase tracking-wide">
            <Star className="w-3.5 h-3.5 fill-white" />
            Featured
          </div>
          <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">
            {video.type === "series" ? "🎬 Series" : "🎥 Movie"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight drop-shadow-2xl">
          {video.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <span className="flex items-center gap-1 text-yellow-400 font-semibold">
            <Star className="w-4 h-4 fill-yellow-400" />
            {video.imdbRating}/10
          </span>
          <span className="text-gray-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {video.year}
          </span>
          <span className="text-gray-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {video.duration}
          </span>
          <span className="border border-gray-500 text-gray-300 px-2 py-0.5 rounded text-xs">
            {video.rating}
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {video.genre.slice(0, 3).map((g) => (
              <span key={g} className="text-gray-300 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-6 max-w-xl line-clamp-3">
          {video.description}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(`/watch/${video.id}`)}
            className="flex items-center gap-2 px-7 py-3 bg-white hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors shadow-lg"
          >
            <Play className="w-5 h-5 fill-black" />
            Play Now
          </button>
          <button
            onClick={() => navigate(`/watch/${video.id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500/40 hover:bg-gray-500/60 text-white font-semibold text-sm rounded-lg transition-colors backdrop-blur-sm border border-white/10"
          >
            <Info className="w-5 h-5" />
            More Info
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => setMuted(!muted)}
            className="ml-auto w-10 h-10 border border-gray-400/50 rounded-full flex items-center justify-center text-white hover:border-white transition-colors backdrop-blur-sm bg-black/20"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Cast */}
        {video.cast && video.cast.length > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            <span className="text-gray-500">Starring: </span>
            {video.cast.join(", ")}
          </div>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
    </div>
  );
}
