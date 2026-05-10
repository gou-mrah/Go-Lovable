import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import UniversalSearch from "@/components/UniversalSearch";
import HeroCarousel from "@/components/HeroCarousel";
import { useAuth } from "@/_core/hooks/useAuth";
import JoinAsProviderModal from "@/components/provider/JoinAsProviderModal";
import { BreakingNewsTicker, LatestNewsSection } from "@/components/media/BreakingNewsTicker";
import {
  Star, Globe, Hotel, Plane, FileText, Car, MapPin, ShoppingBag,
  ArrowRight, CheckCircle, Users, Award, Clock, Shield, ChevronRight,
  Sparkles, HeartHandshake, MessageSquarePlus, Building2,
  Moon, Landmark, BedDouble, Navigation, Stamp, Bus, Compass, Store,
} from "lucide-react";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo_f2b10e83.png";

// ─── Live Stats Bar ──────────────────────────────────────────────────────────
function LiveStatsBar() {
  const [liveStats, setLiveStats] = useState<{ bookings: number; providers: number; users: number } | null>(null);
  useEffect(() => {
    fetch("/api/live-stats").then(r => r.json()).then(setLiveStats).catch(() => {});
    const id = setInterval(() => {
      fetch("/api/live-stats").then(r => r.json()).then(setLiveStats).catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, []);
  if (!liveStats) return null;
  return (
    <div className="bg-[var(--teal-900)] border-b border-[var(--gold)]/20 py-2">
      <div className="container flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-bold text-[var(--gold)]">{liveStats.bookings.toLocaleString()}</span>
          <span>حجز مؤكد</span>
        </span>
        <span className="hidden sm:flex items-center gap-2">
          <span className="font-bold text-[var(--gold)]">{liveStats.providers.toLocaleString()}</span>
          <span>مزود معتمد</span>
        </span>
        <span className="hidden sm:flex items-center gap-2">
          <span className="font-bold text-[var(--gold)]">{liveStats.users.toLocaleString()}</span>
          <span>حاج ومعتمر سعيد</span>
        </span>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-[var(--gold)] text-[var(--gold)]" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

function ProgramCard({ program, type }: { program: any; type: "hajj" | "umrah" }) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const href = type === "hajj" ? `/hajj` : `/umrah`;
  return (
    <div className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--border)] hover:-translate-y-1" onClick={() => (window.location.href = href)}>
      {/* Top gradient bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1B5E52, #C9A96E, #1B5E52)" }} />
      <div className="relative overflow-hidden h-52">
        <img
          src={program.imageUrl || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80"}
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
          {program.isUrgent && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-semibold shadow-sm">
              {t("badge.limited")}
            </span>
          )}
          {program.isFeatured && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A96E] text-white font-semibold shadow-sm">
              {t("badge.featured")}
            </span>
          )}
          {program.badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B5E52] text-white font-semibold shadow-sm">
              {program.badge}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 left-3">
          <h3 className="font-bold text-white text-base leading-tight mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {program.title}
          </h3>
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{program.departureCity || "متعدد المدن"}</span>
            <span>•</span>
            <Clock className="w-3 h-3" />
            <span>{program.duration} {t("common.days")}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        {program.subtitle && (
          <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">{program.subtitle}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(program.features || []).slice(0, 3).map((f: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--teal-50)] text-[var(--teal-700)] border border-[var(--teal-100)]">{f}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div>
            {program.originalPriceUSD && (
              <div className="text-xs text-[var(--muted-foreground)] line-through">
                {format(Number(program.originalPriceUSD))}
              </div>
            )}
            <div className="text-xl font-bold text-[var(--teal-700)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {format(Number(program.priceUSD))}
              <span className="text-xs font-normal text-[var(--muted-foreground)]">/{t("common.person")}</span>
            </div>
          </div>
          <Button size="sm" className="bg-[var(--primary)] text-white hover:bg-[var(--teal-600)] text-xs gap-1 rounded-xl">
            {t("common.bookNow")} <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Service Card - Glassmorphism style
function ServiceCard({ service }: { service: any }) {
  const { t } = useLanguage();
  return (
    <Link href={service.href}>
      <div className="group relative overflow-hidden cursor-pointer rounded-2xl transition-all duration-500 hover:-translate-y-2" style={{ minHeight: 220 }}>
        {/* Layer 1: Card base — very dark, near-transparent */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ background: "rgba(4, 10, 6, 0.88)" }}
        />
        {/* Layer 2: Islamic gold pattern — transparent PNG, gold lines on dark bg */}
        <div
          className="absolute inset-0 rounded-2xl transition-opacity duration-700"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/islamic-pattern-transparent_77cebfa3.png')`,
            backgroundSize: "160px 93px",
            backgroundRepeat: "repeat",
            opacity: 0.5,
          }}
        />
        {/* Layer 2b: Pattern hover brightening */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/islamic-pattern-transparent_77cebfa3.png')`,
            backgroundSize: "160px 93px",
            backgroundRepeat: "repeat",
            opacity: 0.35,
            filter: "brightness(1.6) saturate(1.8) hue-rotate(-5deg)",
          }}
        />
        {/* Layer 3: Color identity gradient — each card has unique tint */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${service.glassBg} 0%, transparent 55%)`,
            opacity: 0.65,
          }}
        />
        {/* Layer 4: Bottom vignette — text readability */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 45%, transparent 100%)",
          }}
        />
        {/* Border + outer glow */}
        <div
          className="absolute inset-0 rounded-2xl transition-all duration-500"
          style={{
            border: `1px solid ${service.glassBorder}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${service.glassShine}`,
          }}
        />
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-all duration-500 group-hover:h-[3px]"
          style={{ background: service.accentLine }}
        />
        {/* Hover glow border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 0 1px ${service.glowBorder}`, background: service.hoverTint }}
        />
        {/* Shimmer sweep on hover — preserved */}
        <div className="card-shimmer" />
        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col" style={{ minHeight: 220 }}>
          {/* Icon + count row */}
          <div className="flex items-start justify-between mb-5">
            {/* Icon circle */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
              style={{ background: service.iconBg, boxShadow: `0 4px 16px ${service.iconShadow}` }}
            >
              <service.Icon className="w-7 h-7" style={{ color: service.iconColor }} />
            </div>
            {/* Count pill */}
            <div
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 group-hover:scale-105"
              style={{ background: service.pillBg, color: service.pillColor, border: `1px solid ${service.pillBorder}` }}
            >
              {service.count}
            </div>
          </div>
          {/* Title */}
          <h3
            className="font-extrabold text-xl mb-2 transition-all duration-300"
            style={{ color: service.titleColor, fontFamily: "'Tajawal', sans-serif", letterSpacing: "-0.01em" }}
          >
            {t(service.labelKey)}
          </h3>
          {/* Description */}
          <p className="text-sm leading-relaxed mb-5 line-clamp-2" style={{ color: service.descColor }}>
            {service.desc}
          </p>
          {/* CTA row */}
          <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: `1px solid ${service.dividerColor}` }}>
            <span
              className="text-xs font-bold tracking-wide transition-all duration-300 group-hover:tracking-wider"
              style={{ color: service.ctaColor }}
            >
              {t("common.explore")}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-400 group-hover:translate-x-1 group-hover:scale-110"
              style={{ background: service.ctaBtnBg, boxShadow: `0 2px 8px ${service.iconShadow}` }}
            >
              <ArrowRight className="w-4 h-4" style={{ color: service.ctaBtnIcon }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Testimonials Marquee Component ──────────────────────────────────────
function TestimonialsMarquee({ testimonials }: { testimonials: Array<{ name: string; location: string; rating: number; text: string; avatar: string }> }) {
  const { t } = useLanguage();
  const [paused, setPaused] = useState(false);

  const filtered = testimonials.filter(t_ => t_.text && t_.text.length > 5);
  // Duplicate cards 2x — translateX(-50%) moves exactly one full set, creating a perfect seamless loop
  // LTR direction: [copy2, copy1] with translateX(0→50%) = copy2 visible first, moves right, copy1 follows seamlessly
  const doubled = [...filtered, ...filtered];

  if (filtered.length === 0) return null;

  const CARD_W = 280;
  const CARD_GAP = 16;
  // Duration based on one full set width at 80px/s
  const trackWidth = filtered.length * (CARD_W + CARD_GAP);
  const durationSec = Math.max(30, trackWidth / 80);

  return (
    <section style={{ paddingTop: 80, paddingBottom: 80, background: 'white' }}>
      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center', marginBottom: 40 }}>
        <span style={{
          display: 'inline-block', marginBottom: 16, padding: '6px 16px',
          background: 'var(--teal-50)', color: 'var(--teal-700)',
          border: '1px solid var(--teal-200)', borderRadius: 999,
          fontSize: 25, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
        }}>
          {t("home.testimonials.badge")}
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal-800)', marginBottom: 8, fontFamily: "'Tajawal', sans-serif" }}>
          {t("home.testimonials.title")}
        </h2>
        <div className="gold-divider" style={{ margin: '0 auto' }} />
        {/* Rating summary + play/pause */}
        <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--gold)">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
            <span style={{ fontWeight: 700, color: 'var(--teal-800)' }}>4.94</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>({filtered.length}+ تقييم)</span>
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              border: '1px solid var(--teal-200)',
              background: 'var(--teal-50)', color: 'var(--teal-700)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer'
            }}
          >
            {paused ? (
              <><svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg> تشغيل</>
            ) : (
              <><svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="2" width="3" height="8" rx="1"/><rect x="7" y="2" width="3" height="8" rx="1"/></svg> إيقاف</>
            )}
          </button>
        </div>
      </div>

      {/* Bulletproof marquee: translateX(-50%) on doubled array = perfect seamless loop */}
      <div
        className="go-marquee-wrapper"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to right, white, transparent)' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2, pointerEvents: 'none',
          background: 'linear-gradient(to left, white, transparent)' }} />

        {/* Track: 2x cards, animation moves -50% = exactly one full set */}
        <div
          className={`go-marquee-track${paused ? ' paused' : ''}`}
          style={{
            gap: CARD_GAP,
            padding: '16px 10px',
            '--marquee-duration': `${durationSec}s`,
          } as React.CSSProperties}
        >
          {doubled.map((t_, idx) => (
            <div
              key={`rev-${idx}`}
              style={{
                flexShrink: 0,
                width: CARD_W,
                minHeight: 190,
                background: 'white',
                borderRadius: 16,
                padding: 20,
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Gold accent line */}
              <div style={{ height: 2, width: '100%', marginBottom: 10, borderRadius: 2,
                background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' }} />
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24"
                    fill={s <= t_.rating ? '#C9A96E' : '#e5e7eb'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              {/* Review text */}
              <p style={{
                color: '#6b7280', fontSize: 12, lineHeight: 1.6,
                fontStyle: 'italic', flex: 1, overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                margin: 0,
              } as React.CSSProperties}>
                "{t_.text.length > 180 ? t_.text.substring(0, 180) + '…' : t_.text}"
              </p>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                paddingTop: 10, marginTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#1B5E52', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 12, flexShrink: 0
                }}>
                  {t_.avatar}
                </div>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 11, color: '#1B5E52',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t_.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#9ca3af',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t_.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinAsProviderBanner() {
  const { user, isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: myApp } = trpc.providerApplication.getMyApplication.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  // Don't show if user is already a provider or admin
  if (user?.role === "provider" || user?.role === "admin") return null;
  // Don't show if already approved
  if (myApp?.status === "approved") return null;

  return (
    <>
      <section id="join-provider" className="py-16 bg-gradient-to-br from-[#F5EFE6] via-[#FAF6F0] to-[#F5EFE6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%231B5E52' stroke-width='0.8'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
          backgroundRepeat: "repeat", backgroundSize: "40px 40px",
        }} />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-[#C9A96E]/20 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Left: Icon + Info */}
                <div className="flex-1 p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1B5E52]/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#1B5E52]" />
                    </div>
                    <Badge className="bg-[#C9A96E]/15 text-[#8B6914] border-[#C9A96E]/30 text-xs">
                      للشركات والوكالات
                    </Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1B5E52] mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    انضم إلينا كمزود خدمة
                  </h2>
                  <p className="text-muted-foreground mb-5 leading-relaxed">
                    هل تمتلك وكالة سفر أو فندقاً أو شركة نقل؟ انضم إلى منصة جو عمرة وابدأ في عرض خدماتك لآلاف الحجاج والمعتمرين من جميع أنحاء العالم.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: <Users className="w-4 h-4" />, text: "آلاف العملاء شهرياً" },
                      { icon: <Shield className="w-4 h-4" />, text: "منصة موثوقة ومعتمدة" },
                      { icon: <Award className="w-4 h-4" />, text: "دعم فني متواصل" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#1B5E52]">
                        <div className="w-7 h-7 rounded-lg bg-[#1B5E52]/10 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/become-provider">
                      <Button
                        size="lg"
                        className="bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white font-semibold px-8 rounded-xl gap-2 w-full sm:w-auto"
                      >
                        <Building2 className="w-4 h-4" />
                        انضم كمزود خدمة
                      </Button>
                    </Link>
                    <Link href="/join-marketer">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-[#1B5E52] text-[#1B5E52] hover:bg-[#1B5E52]/5 font-semibold px-8 rounded-xl gap-2 w-full sm:w-auto"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        انضم كمسوق
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* Right: Steps */}
                <div className="md:w-72 bg-[#1B5E52] p-8 flex flex-col justify-center">
                  <h3 className="text-white font-bold text-lg mb-5" style={{ fontFamily: "'Tajawal', sans-serif" }}>كيف تنضم؟</h3>
                  <div className="space-y-4">
                    {[
                      { step: "1", title: "قدّم طلبك", desc: "أدخل بيانات شركتك وخدماتك" },
                      { step: "2", title: "المراجعة والتحقق", desc: "يراجع فريقنا طلبك خلال 24-48 ساعة" },
                      { step: "3", title: "ابدأ الآن!", desc: "أضف برامجك وتلقّ الحجوزات فوراً" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#C9A96E] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{item.title}</p>
                          <p className="text-white/60 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <JoinAsProviderModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default function Home() {
  useSEO(SEO_CONFIGS.home);
  const { t, isRTL } = useLanguage();
  const { data: featuredHajj } = trpc.hajj.list.useQuery({ featured: true, limit: 3 });
  const { data: featuredUmrah } = trpc.umrah.list.useQuery({ featured: true, limit: 3 });
  const { user } = useAuth();
  const { data: adminStats } = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === 'admin' });

  const services = [
    {
      Icon: Landmark,
      labelKey: "nav.hajj" as const,
      desc: t("home.services.hajj"),
      href: "/hajj",
      glassBg: "rgba(201,169,110,0.08)",
      glassBorder: "rgba(201,169,110,0.22)",
      glassShine: "rgba(255,255,255,0.08)",
      hoverTint: "rgba(201,169,110,0.06)",
      glowBorder: "rgba(201,169,110,0.5)",
      accentLine: "linear-gradient(90deg, #C9A96E, #F0D080, #C9A96E)",
      iconBg: "rgba(201,169,110,0.15)",
      iconColor: "#C9A96E",
      iconShadow: "rgba(201,169,110,0.3)",
      pillBg: "rgba(201,169,110,0.12)",
      pillColor: "#C9A96E",
      pillBorder: "rgba(201,169,110,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(201,169,110,0.15)",
      ctaColor: "#C9A96E",
      ctaBtnBg: "rgba(201,169,110,0.18)",
      ctaBtnIcon: "#C9A96E",
      count: `${adminStats?.hajj ?? "—"} باقة`,
    },
    {
      Icon: Moon,
      labelKey: "nav.umrah" as const,
      desc: t("home.services.umrah"),
      href: "/umrah",
      glassBg: "rgba(27,94,82,0.12)",
      glassBorder: "rgba(74,222,128,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(74,222,128,0.05)",
      glowBorder: "rgba(74,222,128,0.45)",
      accentLine: "linear-gradient(90deg, #1B5E52, #4ade80, #1B5E52)",
      iconBg: "rgba(74,222,128,0.12)",
      iconColor: "#4ade80",
      iconShadow: "rgba(74,222,128,0.3)",
      pillBg: "rgba(74,222,128,0.1)",
      pillColor: "#4ade80",
      pillBorder: "rgba(74,222,128,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(74,222,128,0.15)",
      ctaColor: "#4ade80",
      ctaBtnBg: "rgba(74,222,128,0.15)",
      ctaBtnIcon: "#4ade80",
      count: `${adminStats?.umrah ?? "—"} باقة`,
    },
    {
      Icon: BedDouble,
      labelKey: "nav.hotels" as const,
      desc: t("home.services.hotels"),
      href: "/hotels",
      glassBg: "rgba(59,130,246,0.09)",
      glassBorder: "rgba(147,197,253,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(147,197,253,0.05)",
      glowBorder: "rgba(147,197,253,0.45)",
      accentLine: "linear-gradient(90deg, #3b82f6, #93c5fd, #3b82f6)",
      iconBg: "rgba(147,197,253,0.12)",
      iconColor: "#93c5fd",
      iconShadow: "rgba(59,130,246,0.3)",
      pillBg: "rgba(59,130,246,0.1)",
      pillColor: "#93c5fd",
      pillBorder: "rgba(59,130,246,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(59,130,246,0.15)",
      ctaColor: "#93c5fd",
      ctaBtnBg: "rgba(59,130,246,0.15)",
      ctaBtnIcon: "#93c5fd",
      count: `${adminStats?.hotels ?? "—"} فندق`,
    },
    {
      Icon: Plane,
      labelKey: "nav.flights" as const,
      desc: t("home.services.flights"),
      href: "/flights",
      glassBg: "rgba(168,85,247,0.09)",
      glassBorder: "rgba(216,180,254,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(216,180,254,0.05)",
      glowBorder: "rgba(216,180,254,0.45)",
      accentLine: "linear-gradient(90deg, #a855f7, #d8b4fe, #a855f7)",
      iconBg: "rgba(216,180,254,0.12)",
      iconColor: "#d8b4fe",
      iconShadow: "rgba(168,85,247,0.3)",
      pillBg: "rgba(168,85,247,0.1)",
      pillColor: "#d8b4fe",
      pillBorder: "rgba(168,85,247,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(168,85,247,0.15)",
      ctaColor: "#d8b4fe",
      ctaBtnBg: "rgba(168,85,247,0.15)",
      ctaBtnIcon: "#d8b4fe",
      count: `${adminStats?.flights ?? "—"} رحلة`,
    },
    {
      Icon: Stamp,
      labelKey: "nav.visa" as const,
      desc: t("home.services.visa"),
      href: "/visa",
      glassBg: "rgba(16,185,129,0.09)",
      glassBorder: "rgba(110,231,183,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(110,231,183,0.05)",
      glowBorder: "rgba(110,231,183,0.45)",
      accentLine: "linear-gradient(90deg, #10b981, #6ee7b7, #10b981)",
      iconBg: "rgba(110,231,183,0.12)",
      iconColor: "#6ee7b7",
      iconShadow: "rgba(16,185,129,0.3)",
      pillBg: "rgba(16,185,129,0.1)",
      pillColor: "#6ee7b7",
      pillBorder: "rgba(16,185,129,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(16,185,129,0.15)",
      ctaColor: "#6ee7b7",
      ctaBtnBg: "rgba(16,185,129,0.15)",
      ctaBtnIcon: "#6ee7b7",
      count: `${adminStats?.visaTypes ?? "—"} نوع`,
    },
    {
      Icon: Bus,
      labelKey: "nav.transport" as const,
      desc: t("home.services.transport"),
      href: "/transport",
      glassBg: "rgba(249,115,22,0.09)",
      glassBorder: "rgba(253,186,116,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(253,186,116,0.05)",
      glowBorder: "rgba(253,186,116,0.45)",
      accentLine: "linear-gradient(90deg, #f97316, #fdba74, #f97316)",
      iconBg: "rgba(253,186,116,0.12)",
      iconColor: "#fdba74",
      iconShadow: "rgba(249,115,22,0.3)",
      pillBg: "rgba(249,115,22,0.1)",
      pillColor: "#fdba74",
      pillBorder: "rgba(249,115,22,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(249,115,22,0.15)",
      ctaColor: "#fdba74",
      ctaBtnBg: "rgba(249,115,22,0.15)",
      ctaBtnIcon: "#fdba74",
      count: `${adminStats?.vehicles ?? "—"} مركبة`,
    },
    {
      Icon: Compass,
      labelKey: "nav.tours" as const,
      desc: t("home.services.tours"),
      href: "/tours",
      glassBg: "rgba(236,72,153,0.09)",
      glassBorder: "rgba(249,168,212,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(249,168,212,0.05)",
      glowBorder: "rgba(249,168,212,0.45)",
      accentLine: "linear-gradient(90deg, #ec4899, #f9a8d4, #ec4899)",
      iconBg: "rgba(249,168,212,0.12)",
      iconColor: "#f9a8d4",
      iconShadow: "rgba(236,72,153,0.3)",
      pillBg: "rgba(236,72,153,0.1)",
      pillColor: "#f9a8d4",
      pillBorder: "rgba(236,72,153,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(236,72,153,0.15)",
      ctaColor: "#f9a8d4",
      ctaBtnBg: "rgba(236,72,153,0.15)",
      ctaBtnIcon: "#f9a8d4",
      count: `${adminStats?.tours ?? "—"} جولة`,
    },
    {
      Icon: Store,
      labelKey: "nav.store" as const,
      desc: t("home.services.store"),
      href: "/store",
      glassBg: "rgba(99,102,241,0.09)",
      glassBorder: "rgba(165,180,252,0.2)",
      glassShine: "rgba(255,255,255,0.07)",
      hoverTint: "rgba(165,180,252,0.05)",
      glowBorder: "rgba(165,180,252,0.45)",
      accentLine: "linear-gradient(90deg, #6366f1, #a5b4fc, #6366f1)",
      iconBg: "rgba(165,180,252,0.12)",
      iconColor: "#a5b4fc",
      iconShadow: "rgba(99,102,241,0.3)",
      pillBg: "rgba(99,102,241,0.1)",
      pillColor: "#a5b4fc",
      pillBorder: "rgba(99,102,241,0.3)",
      titleColor: "#F5EFE6",
      descColor: "rgba(245,239,230,0.55)",
      dividerColor: "rgba(99,102,241,0.15)",
      ctaColor: "#a5b4fc",
      ctaBtnBg: "rgba(99,102,241,0.15)",
      ctaBtnIcon: "#a5b4fc",
      count: `${adminStats?.products ?? "—"} منتج`,
    },
  ];

  const stats = [
    { value: "50,000+", labelKey: "home.stats.pilgrims" as const, icon: Users },
    { value: "15+", labelKey: "home.stats.years" as const, icon: Award },
    { value: "98%", labelKey: "home.stats.satisfaction" as const, icon: Star },
    { value: "24/7", labelKey: "home.stats.support" as const, icon: Clock },
  ];

  const features = [
    t("home.features.licensed"),
    t("home.features.multilingual"),
    t("home.features.transparent"),
    t("home.features.payment"),
    t("home.features.realtime"),
    t("home.features.insurance"),
  ];

  const { data: zidReviews } = trpc.reviews.getZidReviews.useQuery({ limit: 500, minRating: 1 });
  // Build testimonials from real Zid data, fallback to static if not loaded
  const testimonials = (zidReviews && zidReviews.length > 0)
    ? zidReviews.filter(r => r.reviewText && r.reviewText.length > 10).map(r => ({
        name: r.reviewerName || "عميل كريم",
        location: r.productName || "خدمات جو عمرة",
        rating: r.rating || 5,
        text: r.reviewText || "",
        avatar: (r.reviewerName || "ع").charAt(0).toUpperCase(),
      }))
    : [
        { name: "أحمد الراشدي", location: "لندن، المملكة المتحدة", rating: 5, text: t("home.testimonials.t1"), avatar: "أ" },
        { name: "فاطمة حسن", location: "تورنتو، كندا", rating: 5, text: t("home.testimonials.t2"), avatar: "ف" },
        { name: "محمد الفارسي", location: "دبي، الإمارات", rating: 5, text: t("home.testimonials.t3"), avatar: "م" },
      ];

  const fallbackHajj = [
    { id: 1, title: "باقة الحج المميزة 2025", subtitle: "فنادق 5 نجوم • مواصلات VIP • مرشدون خبراء", priceUSD: "31875", originalPriceUSD: "35625", duration: 21, isUrgent: true, isFeatured: true, features: ["فندق 5 نجوم", "مواصلات VIP", "مرشد خبير"], imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-hero_cc30eaae.jpg", departureCity: "لندن" },
    { id: 2, title: "رحلة الحج المميزة", subtitle: "فنادق 4 نجوم • إرشاد جماعي • إقامة كاملة", priceUSD: "20625", duration: 18, isFeatured: true, features: ["فندق 4 نجوم", "إقامة كاملة", "جولة جماعية"], imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80", departureCity: "دبي" },
    { id: 3, title: "باقة الحج الاقتصادية", subtitle: "فنادق 3 نجوم • مواصلات مشتركة • مع مرشد", priceUSD: "12000", duration: 14, badge: "أفضل قيمة", features: ["فندق 3 نجوم", "حافلة مشتركة", "مع مرشد"], imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80", departureCity: "القاهرة" },
  ];

  const fallbackUmrah = [
    { id: 1, title: "باقة العمرة الفاخرة", subtitle: "فنادق 5 نجوم • مواصلات خاصة • 10 ليالٍ", priceUSD: "10500", originalPriceUSD: "12000", duration: 10, isUrgent: true, isFeatured: true, features: ["فندق 5 نجوم", "سيارة خاصة", "تأشيرة مشمولة"], imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-night_9e554532.jpg", departureCity: "لندن" },
    { id: 2, title: "عمرة العائلة المميزة", subtitle: "فنادق 4 نجوم • غرف عائلية • 7 ليالٍ", priceUSD: "6750", duration: 7, isFeatured: true, badge: "عرض عائلي", features: ["فندق 4 نجوم", "غرفة عائلية", "مناسب للأطفال"], imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80", departureCity: "مانشستر" },
    { id: 3, title: "عمرة رمضان المبارك", subtitle: "تجربة رمضانية مميزة • 14 ليلة", priceUSD: "13125", duration: 14, badge: "رمضان خاص", features: ["فندق 5 نجوم", "إفطار مشمول", "صلاة التراويح"], imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80", departureCity: "برمنغهام" },
  ];

  return (
    <div className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Breaking News Ticker ────────────────────────────────────────────── */}
      {/* ── Hero Section — 3 zones ─────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden flex flex-col"
        style={{
          background: "#071a12",
          marginTop: "-112px",   /* pull behind fixed navbar + ticker */
          paddingTop: "112px",   /* push content below navbar */
          height: "100svh",
          minHeight: "680px",
        }}
      >
        {/* ── Kaaba background image with overlay ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-hero_cc30eaae.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
            opacity: 0.22,
          }}
        />
        {/* Dark gradient overlay for readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(7,26,18,0.55) 0%, rgba(7,26,18,0.30) 35%, rgba(7,26,18,0.55) 65%, rgba(7,26,18,0.90) 100%)",
          }}
        />
        {/* Gold radial glow at top */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(ellipse 70% 45% at 50% 10%, rgba(201,169,110,0.10) 0%, transparent 70%)",
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════
            ZONE 1 — Brand text + slogan + stats
        ═══════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-2 pb-2 flex-grow">
          {/* Bismillah */}
          <p
            className="text-[var(--gold)]/60 mb-1 tracking-widest select-none"
            style={{
              fontFamily: "'Noto Naskh Arabic', serif",
              fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
              letterSpacing: "0.1em",
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Brand name */}
          <h1
            className="font-extrabold leading-none mb-1 select-none"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
              textShadow: "0 4px 40px rgba(0,0,0,0.4)",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "#C9A96E" }}>جو</span>
            {" "}
            <span className="text-white">عُمْرَة</span>
          </h1>

          {/* English sub-brand */}
          <p
            className="text-white/40 font-light tracking-[0.35em] uppercase mb-2 select-none"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(0.55rem, 1vw, 0.75rem)",
            }}
          >
            Go Umrah
          </p>

          {/* Slogan */}
          <p
            className="text-white/80 font-semibold max-w-lg mx-auto leading-relaxed mb-3"
            style={{
              fontFamily: "'Tajawal', sans-serif",
              fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
            }}
          >
            {isRTL
              ? "شريكك الموثوق لكل خطوة نحو البيت الحرام"
              : "Your trusted companion for every step toward the Holy House"}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 md:gap-6 justify-center">
            {stats.map((s) => (
              <div key={s.labelKey} className="text-center">
                <div
                  className="font-extrabold text-[var(--gold)]"
                  style={{
                    fontFamily: "'Tajawal', sans-serif",
                    fontSize: "clamp(0.85rem, 1.8vw, 1.2rem)",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-white/50 text-xs mt-0.5 tracking-wide">
                  {t(s.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ZONE 2 — Ads carousel (standalone cards, separate from bg)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 w-full px-4 py-2 flex-shrink-0 flex flex-col items-center justify-center">
          {/* Thin gold divider line above */}
          <div
            className="w-24 h-px mb-2 mx-auto"
            style={{
              background: "linear-gradient(to right, transparent, rgba(201,169,110,0.5), transparent)",
            }}
          />
          <HeroCarousel />
          {/* Thin gold divider line below */}
          <div
            className="w-24 h-px mt-2 mx-auto"
            style={{
              background: "linear-gradient(to right, transparent, rgba(201,169,110,0.5), transparent)",
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ZONE 3 — Search engine panel
        ═══════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 w-full px-3 md:px-6 pb-4 flex-shrink-0 flex flex-col items-center">
          {/* Search frame wrapper with premium gold border */}
          <div
            className="w-full max-w-5xl rounded-2xl overflow-hidden"
            style={{
              background: "rgba(5, 18, 12, 0.82)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1.5px solid rgba(201,169,110,0.45)",
              boxShadow:
                "0 0 0 1px rgba(201,169,110,0.08), 0 12px 60px rgba(0,0,0,0.65), 0 1px 0 rgba(201,169,110,0.35) inset, 0 -1px 0 rgba(201,169,110,0.15) inset",
              position: "relative",
            }}
          >
            {/* Top gold shimmer line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.7) 30%, rgba(255,220,130,0.9) 50%, rgba(201,169,110,0.7) 70%, transparent 100%)",
                borderRadius: "2px 2px 0 0",
              }}
            />
            <UniversalSearch />
          </div>

          {/* Scroll-down CTA */}
          <div
            className="flex flex-col items-center gap-1 mt-3 cursor-pointer select-none group"
            onClick={() => {
              const el = document.getElementById("services-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <p
              style={{
                color: "rgba(201,169,110,0.85)",
                fontSize: "0.82rem",
                letterSpacing: "0.18em",
                fontFamily: "'Tajawal', sans-serif",
                fontWeight: 500,
                textTransform: "uppercase",
              }}
              className="group-hover:text-[#C9A96E] transition-colors duration-300"
            >
              اكتشف خدماتنا
            </p>
            {/* Animated chevron arrows */}
            <div className="flex flex-col items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  width="18"
                  height="10"
                  viewBox="0 0 18 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    opacity: 1 - i * 0.28,
                    animation: `heroScrollBounce 1.6s ease-in-out ${i * 0.18}s infinite`,
                  }}
                >
                  <path
                    d="M1 1L9 9L17 1"
                    stroke="#C9A96E"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Keyframe for scroll bounce */}
        <style>{`
          @keyframes heroScrollBounce {
            0%, 100% { transform: translateY(0); opacity: inherit; }
            50% { transform: translateY(5px); }
          }
        `}</style>
      </section>

      {/* ── Live Stats Bar ───────────────────────────────────────────────────────────────────────────────── */}
      <LiveStatsBar />
      {/* ── Services Grid ─────────────────────────────────────────────────────────────────────────────────────── */}      <section id="services-section" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a1a14 0%, #0d2018 40%, #0a1a14 100%)" }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`, backgroundRepeat: "repeat", backgroundSize: "80px 80px" }} />
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, #C9A96E, #1B5E52, #C9A96E, transparent)" }} />
        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, transparent, #1B5E52, #C9A96E, #1B5E52, transparent)" }} />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#C9A96E]/10 border border-[#C9A96E]/25 text-[#C9A96E] text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] inline-block" />
              {t("home.services.badge")}
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] inline-block" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight" style={{ fontFamily: "'Tajawal', sans-serif", textShadow: "0 2px 20px rgba(201,169,110,0.2)" }}>
              {t("home.services.title")}
            </h2>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A96E]" />
              <div className="w-2 h-2 rotate-45 bg-[#C9A96E]" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A96E]" />
            </div>
            <p className="text-white/50 mt-2 max-w-xl mx-auto text-base leading-relaxed">
              {t("home.services.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.href} service={s} />
            ))}
          </div>
        </div>
      </section>  {/* ── Flexible Request Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-[var(--teal-900)] via-[var(--teal-800)] to-[var(--teal-900)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
          backgroundRepeat: "repeat", backgroundSize: "60px 60px",
        }} />
        <div className="container relative z-10" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-right">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/20 border border-[var(--gold)]/30 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <Badge className="bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs">
                  خدمة مخصصة
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                لم تجد ما تبحث عنه؟
              </h2>
              <p className="text-white/70 max-w-lg leading-relaxed">
                أرسل لنا طلبك المرن وسيتواصل معك فريق متخصص لتصميم رحلتك المثالية وفق احتياجاتك وميزانيتك
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/flexible-request">
                <Button size="lg" className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-white font-bold px-8 gap-2 rounded-xl shadow-lg">
                  <MessageSquarePlus className="w-5 h-5" />
                  أرسل طلبك المرن
                </Button>
              </Link>
              <Link href="/umrah">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold px-8 rounded-xl">
                  تصفح الباقات
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { icon: Sparkles, label: "تصميم مخصص", desc: "رحلة مصممة خصيصاً لك" },
              { icon: Clock, label: "رد سريع", desc: "خلال 24 ساعة" },
              { icon: Shield, label: "ضمان الجودة", desc: "خدمة موثوقة ومرخصة" },
              { icon: HeartHandshake, label: "دعم كامل", desc: "معك في كل خطوة" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-[var(--gold)]" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">{f.label}</div>
                  <div className="text-white/50 text-[10px]">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Hajj Programs ────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge className="mb-3 bg-amber-50 text-amber-700 border-amber-200 text-xs tracking-widest uppercase px-4 py-1.5">
                {t("home.hajj.badge")}
              </Badge>
              <h2 className="text-3xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {t("home.hajj.title")}
              </h2>
              <div className="gold-divider" />
            </div>
            <Link href="/hajj">
              <Button variant="outline" className="border-[var(--teal-300)] text-[var(--teal-700)] hover:bg-[var(--teal-50)] gap-2">
                {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredHajj && featuredHajj.length > 0 ? featuredHajj : fallbackHajj).map((p: any) => (
              <ProgramCard key={p.id} program={p} type="hajj" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Umrah Programs ───────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge className="mb-3 bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)] text-xs tracking-widest uppercase px-4 py-1.5">
                {t("home.umrah.badge")}
              </Badge>
              <h2 className="text-3xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {t("home.umrah.title")}
              </h2>
              <div className="gold-divider" />
            </div>
            <Link href="/umrah">
              <Button variant="outline" className="border-[var(--teal-300)] text-[var(--teal-700)] hover:bg-[var(--teal-50)] gap-2">
                {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredUmrah && featuredUmrah.length > 0 ? featuredUmrah : fallbackUmrah).map((p: any) => (
              <ProgramCard key={p.id} program={p} type="umrah" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────────── */}
      <section className="py-20 islamic-pattern bg-[var(--teal-900)]">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
                {t("home.why.badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {t("home.why.title")}<br />
                <span className="text-[var(--gold)]">{t("home.why.titleHighlight")}</span>
              </h2>
              <div className="gold-divider" />
              <p className="text-white/70 mt-4 mb-8 leading-relaxed">
                {t("home.why.subtitle")}
              </p>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <CheckCircle className="w-5 h-5 text-[var(--gold)] flex-shrink-0" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/umrah">
                  <Button className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-white font-semibold px-8 gap-2">
                    {t("home.why.cta")} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.labelKey} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center hover:bg-white/15 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center mx-auto mb-3">
                    <s.icon className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div className="text-3xl font-bold text-[var(--gold)] mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.value}</div>
                  <div className="text-white/60 text-sm">{t(s.labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials Marquee ─────────────────────────────────────────────── */}
      <TestimonialsMarquee testimonials={testimonials} />
      {/* ── Latest News Section ─────────────────────────────────────────────────── */}
      <LatestNewsSection />
      {/* ── Join as Provider Banner ───────────────────────────────────────────────────── */}
      <JoinAsProviderBanner />

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[var(--teal-800)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
          backgroundRepeat: "repeat", backgroundSize: "60px 60px",
        }} />
        <div className="container text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {t("home.cta.title")}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {t("home.cta.subtitle")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/hajj">
              <Button size="lg" className="bg-[var(--gold)] hover:bg-[var(--gold-dark)] text-white font-semibold px-8 rounded-xl">
                {t("home.cta.hajjBtn")}
              </Button>
            </Link>
            <Link href="/umrah">
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 font-semibold px-8 rounded-xl">
                {t("home.cta.umrahBtn")}
              </Button>
            </Link>
            <Link href="/flexible-request">
              <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 rounded-xl border border-white/30 gap-2">
                <MessageSquarePlus className="w-4 h-4" />
                طلب مرن
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
