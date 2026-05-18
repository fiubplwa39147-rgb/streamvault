import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
  Loader2,
  Maximize2,
  Volume2,
} from "lucide-react";
import { Video } from "../types";
import { useAuth } from "../context/AuthContext";
import { generateToken } from "../data/demoData";

interface SmartPlayerProps {
  video: Video;
  onClose?: () => void;
}

type AdState = "pre-roll" | "none" | "pause-ad";

export default function SmartPlayer({ video, onClose }: SmartPlayerProps) {
  const { currentUser } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sources = [
    video.sources.primary,
    video.sources.backup1,
    video.sources.backup2,
  ].filter(Boolean) as string[];

  const [sourceIndex, setSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);
  const [adState, setAdState] = useState<AdState>("pre-roll");
  const [adCountdown, setAdCountdown] = useState(5);
  const [token] = useState(() =>
    currentUser ? generateToken(currentUser.uid, video.id) : "guest"
  );
  const [showSource, setShowSource] = useState(false);

  const isPro = currentUser?.plan === "pro";

  // Pre-roll ad logic
  useEffect(() => {
    if (isPro) {
      setAdState("none");
      return;
    }
    setAdState("pre-roll");
    setAdCountdown(5);
    const interval = setInterval(() => {
      setAdCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setAdState("none");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPro, video.id]);

  const loadVideo = (index: number) => {
    setSourceIndex(index);
    setIsLoading(true);
  };

  const handleError = () => {
    const next = sourceIndex + 1;
    if (next < sources.length) {
      loadVideo(next);
    } else {
      setAllFailed(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Build embed URL with token and fix FileMoon links
  const buildEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      let embedUrl = url;
      if (url.includes("filemoon")) {
        // Extract ID: handles /ID/file or /e/ID or just /ID
        const match = url.match(/\/([a-zA-Z0-9]+)(\/file|\/?$)/);
        if (match && match[1]) {
          const id = match[1];
          const urlObj = new URL(url);
          // Keep the same domain but change path to /e/ID
          embedUrl = `${urlObj.protocol}//${urlObj.host}/e/${id}`;
        }
      }
      
      const u = new URL(embedUrl);
      u.searchParams.set("autoplay", "1");
      return u.toString();
    } catch {
      return url;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Pre-roll Ad */}
      {adState === "pre-roll" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <div className="text-center max-w-md px-6">
            {/* Ad Banner */}
            <div className="relative mb-6 rounded-xl overflow-hidden border border-gray-700">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 p-6 text-center">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-yellow-400 font-bold text-lg mb-1">StreamVault Pro</p>
                <p className="text-gray-300 text-sm">Watch without interruptions</p>
                <div className="mt-3 flex gap-2 justify-center">
                  <span className="text-green-400 text-sm">✓ No Ads</span>
                  <span className="text-green-400 text-sm">✓ HD Quality</span>
                  <span className="text-green-400 text-sm">✓ All Content</span>
                </div>
                <div className="mt-2 text-yellow-300 font-bold text-xl">Only $9.99/month</div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                  AD
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              {adCountdown > 0 ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">
                    Video starts in <span className="text-white font-bold">{adCountdown}s</span>
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setAdState("none")}
                  className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition"
                >
                  Watch Now →
                </button>
              )}
              <span className="text-gray-500 text-xs">or</span>
              <a
                href="/settings"
                className="text-red-400 text-sm hover:text-red-300 underline font-medium"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      )}

      {/* All Sources Failed */}
      {allFailed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900 text-center px-4">
          <WifiOff className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">Video Unavailable</h3>
          <p className="text-gray-400 text-sm mb-4">
            All streaming sources failed. Please try again later.
          </p>
          <button
            onClick={() => { setAllFailed(false); loadVideo(0); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !allFailed && adState === "none" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Loading source {sourceIndex + 1} of {sources.length}…
            </p>
          </div>
        </div>
      )}

      {/* Source Switching Notice */}
      {sourceIndex > 0 && !allFailed && !isLoading && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-yellow-500/90 text-black text-xs font-medium px-3 py-1.5 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          Switched to backup source {sourceIndex}
        </div>
      )}

      {/* Player Renderer (Handles both URL and Full HTML Embed Code) */}
      {adState === "none" && !allFailed && sources[sourceIndex] && (
        sources[sourceIndex].includes("<iframe") ? (
          // Render full HTML embed code directly
          <div 
            className="w-full h-full [&>div]:w-full [&>div]:h-full [&>div>iframe]:w-full [&>div>iframe]:h-full [&>div>iframe]:border-0" 
            dangerouslySetInnerHTML={{ __html: sources[sourceIndex] }} 
          />
        ) : (
          // Render standard iframe from URL
          <iframe
            ref={iframeRef}
            key={`${video.id}-${sourceIndex}`}
            src={buildEmbedUrl(sources[sourceIndex])}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={handleLoad}
            onError={handleError}
            title={video.title}
          />
        )
      )}

      {/* Player Controls Overlay */}
      {adState === "none" && !allFailed && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            {sources.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSource(!showSource)}
                  className="flex items-center gap-1 text-xs text-white bg-white/20 hover:bg-white/30 px-2 py-1 rounded backdrop-blur-sm"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  Source {sourceIndex + 1}
                </button>
                {showSource && (
                  <div className="absolute bottom-full mb-1 left-0 bg-black/90 rounded shadow-lg overflow-hidden min-w-28">
                    {sources.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { loadVideo(i); setShowSource(false); }}
                        className={`block w-full text-left px-3 py-1.5 text-xs ${
                          i === sourceIndex
                            ? "text-red-400 bg-white/10"
                            : "text-white hover:bg-white/10"
                        }`}
                      >
                        Source {i + 1}{i === 0 ? " (Primary)" : ` (Backup ${i})`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <span className="text-xs text-gray-300 bg-black/40 px-2 py-1 rounded">
              <Volume2 className="w-3 h-3 inline mr-1" />
              {isPro ? "Pro HD" : "Standard"}
            </span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="text-white bg-white/20 hover:bg-white/30 p-1.5 rounded backdrop-blur-sm"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Token Debug (dev) */}
      <div className="absolute bottom-0 right-0 opacity-0 text-[8px] text-gray-700 select-none pointer-events-none p-1">
        {token.slice(0, 12)}
      </div>
    </div>
  );
}
