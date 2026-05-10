import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Rss, ExternalLink } from "lucide-react";

interface NewsTickerBarProps {
  bgClass?: string;
  textClass?: string;
  labelBgClass?: string;
  labelTextClass?: string;
  speed?: number;
  limit?: number;
  language?: "ar" | "en" | "all";
  category?: "hajj" | "umrah" | "general" | "official" | "all";
  heightClass?: string;
}

export default function NewsTickerBar({
  bgClass = "bg-[var(--teal-900)]",
  textClass = "text-white/90",
  labelBgClass = "bg-[var(--gold)]",
  labelTextClass = "text-[var(--teal-900)]",
  speed = 60,
  limit = 20,
  language = "ar",
  category = "all",
  heightClass = "h-9",
}: NewsTickerBarProps) {
  const { data: articles, isLoading } = trpc.news.getLatest.useQuery(
    { limit, language, category },
    { refetchInterval: 5 * 60 * 1000 }
  );

  const tickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const posRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!contentRef.current || !tickerRef.current) return;
    const updateWidths = () => {
      if (contentRef.current && tickerRef.current) {
        setContentWidth(contentRef.current.scrollWidth);
        setContainerWidth(tickerRef.current.clientWidth);
      }
    };
    updateWidths();
    const ro = new ResizeObserver(updateWidths);
    ro.observe(tickerRef.current);
    return () => ro.disconnect();
  }, [articles]);

  useEffect(() => {
    if (!contentRef.current || contentWidth === 0 || isPaused) return;
    let lastTime: number | null = null;
    const animate = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      // Move from left to right (positive direction in LTR context)
      posRef.current += speed * delta;
      // When content fully exits right side, reset to left side
      if (posRef.current > contentWidth / 2) {
        posRef.current = 0;
      }
      if (contentRef.current) {
        contentRef.current.style.transform = `translateX(${posRef.current}px)`;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    // Start from left side (off-screen to the left)
    if (posRef.current === 0) {
      posRef.current = -(contentWidth / 2);
    }
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [contentWidth, containerWidth, speed, isPaused]);

  if (isLoading) {
    return (
      <div
        className={`${bgClass} ${heightClass} flex items-center overflow-hidden`}
        dir="ltr"
      >
        <div
          className={`${labelBgClass} ${labelTextClass} px-3 h-full flex items-center gap-1.5 text-xs font-bold flex-shrink-0 whitespace-nowrap`}
          dir="rtl"
        >
          <Rss className="w-3 h-3" />
          <span>أخبار الحج والعمرة</span>
        </div>
        <div className="flex-1 px-4">
          <div className="h-3 bg-white/10 rounded animate-pulse w-64" />
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  // Build flat content: duplicate for seamless loop
  const allArticles = [...articles, ...articles];

  return (
    <div
      className={`${bgClass} ${heightClass} flex items-center overflow-hidden select-none`}
      dir="ltr"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Label — always on the right in Arabic context */}
      <div
        className={`${labelBgClass} ${labelTextClass} px-3 h-full flex items-center gap-1.5 text-xs font-bold flex-shrink-0 whitespace-nowrap z-10 shadow-md`}
        dir="rtl"
        style={{ minWidth: "fit-content", order: 2 }}
      >
        <Rss className="w-3 h-3" />
        <span>أخبار الحج والعمرة</span>
      </div>

      {/* Ticker container — LTR so translateX works correctly */}
      <div
        ref={tickerRef}
        className="flex-1 overflow-hidden relative h-full"
        style={{ order: 1 }}
      >
        {/* Scrolling content */}
        <div
          ref={contentRef}
          className="absolute top-0 h-full flex items-center whitespace-nowrap will-change-transform"
          dir="rtl"
        >
          {allArticles.map((article, i) => (
            <span key={`${article.id}-${i}`} className="inline-flex items-center gap-2">
              {/* Separator */}
              <span className="mx-4 text-white/30 text-lg">◆</span>
              {/* Source badge */}
              <span className="text-[10px] font-medium opacity-60 bg-white/10 px-1.5 py-0.5 rounded">
                {article.sourceName}
              </span>
              {/* Title */}
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textClass} text-xs hover:text-[var(--gold)] transition-colors cursor-pointer`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {article.title}
                  <ExternalLink className="inline-block w-2.5 h-2.5 mr-1 opacity-50" />
                </a>
              ) : (
                <span className={`${textClass} text-xs`}>{article.title}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
