import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Eye,
  Share2,
  Heart,
  Download,
  Lock,
  Film,
} from "lucide-react";
import SmartPlayer from "../components/SmartPlayer";
import { useVideos } from "../context/VideoContext";
import { useAuth } from "../context/AuthContext";
import { formatViews } from "../data/demoData";

// Pause Ad Component
function PauseAd({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-purple-900/80 border border-blue-700/50 rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-lg shrink-0">
          🎵
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Enjoy Music Ad-Free</p>
          <p className="text-blue-300 text-xs">Stream 100M+ songs — Try for free</p>
        </div>
      </div>
      <a
        href="#"
        className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
      >
        Try Free
      </a>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 text-xs"
      >
        ✕
      </button>
      <span className="absolute bottom-1 right-2 text-xs text-gray-600">Ad</span>
    </div>
  );
}

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVideoById, incrementViews, videos } = useVideos();
  const { currentUser } = useAuth();

  const video = useMemo(() => (id ? getVideoById(id) : undefined), [id, videos]);

  const related = useMemo(
    () =>
      videos
        .filter(
          (v) =>
            v.id !== id &&
            (v.category === video?.category ||
              v.genre.some((g) => video?.genre.includes(g)))
        )
        .slice(0, 8),
    [video, videos, id]
  );

  useEffect(() => {
    if (id) {
      incrementViews(id);
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (!video) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Video Not Found</h2>
          <p className="text-gray-400 mb-6">This video doesn't exist or was removed.</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isPro = currentUser?.plan === "pro";

  return (
    <div className="min-h-screen bg-[#141414] pt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back</span>
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-5">
            {/* Player */}
            <SmartPlayer video={video} />

            {/* Video Info */}
            <div className="space-y-4">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 leading-tight">
                    {video.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {video.imdbRating}/10 IMDb
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {video.year}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {video.duration}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(video.views)} views
                    </span>
                    <span className="border border-gray-600 text-gray-300 px-2 py-0.5 rounded text-xs">
                      {video.rating}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs">Like</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-xs">Share</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-1 transition-colors ${
                      isPro
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 cursor-not-allowed"
                    }`}
                    title={!isPro ? "Pro plan required" : ""}
                  >
                    {isPro ? (
                      <Download className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                    <span className="text-xs">{isPro ? "Download" : "Pro Only"}</span>
                  </button>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {video.genre.map((g) => (
                  <Link
                    key={g}
                    to={`/browse?category=${g}`}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 text-xs font-medium rounded-full transition-colors"
                  >
                    {g}
                  </Link>
                ))}
              </div>

              {/* Description */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wide text-gray-400">
                  Synopsis
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">{video.description}</p>
              </div>

              {/* Cast & Crew */}
              {(video.cast?.length || video.director) && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                  {video.director && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs uppercase tracking-wide w-20 shrink-0">
                        Director
                      </span>
                      <span className="text-white text-sm font-medium">{video.director}</span>
                    </div>
                  )}
                  {video.cast && video.cast.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 text-xs uppercase tracking-wide w-20 shrink-0 mt-0.5">
                        Cast
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {video.cast.map((actor) => (
                          <span
                            key={actor}
                            className="bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full"
                          >
                            {actor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pause Ad (free users) */}
              {!isPro && (
                <PauseAd onClose={() => {}} />
              )}
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="xl:col-span-1">
            <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Film className="w-4 h-4 text-red-500" />
              Related Videos
            </h2>

            {/* Sidebar Ad */}
            {!isPro && (
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-700">
                <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 p-4 text-center">
                  <div className="text-3xl mb-2">🎬</div>
                  <p className="text-white font-bold text-sm mb-1">Watch Without Ads</p>
                  <p className="text-gray-400 text-xs mb-3">Upgrade to StreamVault Pro</p>
                  <Link
                    to="/settings"
                    className="block w-full py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Get Pro — $9.99/mo
                  </Link>
                  <p className="text-xs text-gray-600 mt-2">Ad</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {related.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate(`/watch/${v.id}`)}
                  className="w-full flex gap-3 group hover:bg-white/5 rounded-lg p-2 transition-colors text-left"
                >
                  <div className="relative w-32 shrink-0 rounded overflow-hidden aspect-video bg-gray-800">
                    <img
                      src={v.thumbnail}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="w-7 h-7 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs">▶</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <p className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">
                      {v.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{v.category}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {v.imdbRating}
                      <span>•</span>
                      {v.year}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
