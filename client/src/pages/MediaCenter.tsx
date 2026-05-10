import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Newspaper, Bell, BookOpen, Megaphone, Search, Eye, Calendar,
  ChevronRight, Pin, Zap, Filter
} from "lucide-react";

// ─── Type & Category Maps ─────────────────────────────────────────────────────
const TYPE_MAP = {
  news:         { label: "أخبار",     icon: Newspaper,  color: "bg-blue-100 text-blue-700 border-blue-200" },
  alert:        { label: "تنبيهات",   icon: Bell,       color: "bg-red-100 text-red-700 border-red-200" },
  article:      { label: "مقالات",    icon: BookOpen,   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  announcement: { label: "إعلانات",   icon: Megaphone,  color: "bg-amber-100 text-amber-700 border-amber-200" },
} as const;

const CATEGORY_MAP = {
  hajj:      { label: "الحج",              emoji: "🕋" },
  umrah:     { label: "العمرة",            emoji: "🌙" },
  hotels:    { label: "الفنادق",           emoji: "🏨" },
  flights:   { label: "الرحلات الجوية",   emoji: "✈️" },
  visa:      { label: "التأشيرات",         emoji: "📋" },
  store:     { label: "المتجر",            emoji: "🛍️" },
  tours:     { label: "الجولات السياحية", emoji: "🗺️" },
  transport: { label: "المواصلات",         emoji: "🚌" },
  general:   { label: "عام",              emoji: "📰" },
} as const;

type PostType = keyof typeof TYPE_MAP;
type PostCategory = keyof typeof CATEGORY_MAP;

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, onClick }: { post: any; onClick: () => void }) {
  const typeInfo = TYPE_MAP[post.type as PostType] ?? TYPE_MAP.news;
  const catInfo = CATEGORY_MAP[post.category as PostCategory] ?? CATEGORY_MAP.general;
  const TypeIcon = typeInfo.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-[var(--border)] overflow-hidden cursor-pointer hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300"
    >
      {/* Image */}
      {post.imageUrl ? (
        <div className="relative h-48 overflow-hidden">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {post.isBreaking && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              <Zap className="w-3 h-3" /> عاجل
            </div>
          )}
          {post.isPinned && (
            <div className="absolute top-3 left-3 bg-[var(--primary)] text-white p-1 rounded-full">
              <Pin className="w-3 h-3" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-32 bg-gradient-to-br from-[var(--teal-800)] to-[var(--teal-600)] flex items-center justify-center">
          <TypeIcon className="w-12 h-12 text-white/30" />
          {post.isBreaking && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              <Zap className="w-3 h-3" /> عاجل
            </div>
          )}
          {post.isPinned && (
            <div className="absolute top-3 left-3 bg-white/20 text-white p-1 rounded-full">
              <Pin className="w-3 h-3" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${typeInfo.color}`}>
            <TypeIcon className="w-3 h-3 ml-1" />
            {typeInfo.label}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)]">
            {catInfo.emoji} {catInfo.label}
          </Badge>
        </div>

        <h3 className="font-bold text-[var(--teal-800)] leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          {post.title}
        </h3>

        {post.summary && (
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
            {post.summary}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            {post.author && <span>{post.author}</span>}
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views.toLocaleString()}</span>
          </div>
          <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.createdAt).toLocaleDateString("ar-SA", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Post Detail Modal ────────────────────────────────────────────────────────
function PostDetailModal({ postId, onClose }: { postId: number; onClose: () => void }) {
  const { data: post, isLoading } = trpc.media.getById.useQuery({ id: postId });
  const typeInfo = post ? (TYPE_MAP[post.type as PostType] ?? TYPE_MAP.news) : null;
  const catInfo = post ? (CATEGORY_MAP[post.category as PostCategory] ?? CATEGORY_MAP.general) : null;
  const TypeIcon = typeInfo?.icon ?? Newspaper;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : post ? (
          <>
            {post.imageUrl && (
              <div className="h-56 overflow-hidden rounded-t-3xl">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {typeInfo && (
                  <Badge variant="outline" className={`text-xs px-2 py-0.5 ${typeInfo.color}`}>
                    <TypeIcon className="w-3 h-3 ml-1" />
                    {typeInfo.label}
                  </Badge>
                )}
                {catInfo && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)]">
                    {catInfo.emoji} {catInfo.label}
                  </Badge>
                )}
                {post.isBreaking && (
                  <Badge className="text-xs bg-red-600 text-white animate-pulse">
                    <Zap className="w-3 h-3 ml-1" /> عاجل
                  </Badge>
                )}
              </div>

              <h2 className="text-2xl font-bold text-[var(--teal-800)] leading-snug" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {post.title}
              </h2>

              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)] border-b border-[var(--border)] pb-4">
                {post.author && <span className="font-medium text-[var(--teal-700)]">{post.author}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(post.createdAt).toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views.toLocaleString()} مشاهدة</span>
              </div>

              {post.summary && (
                <p className="text-base font-medium text-[var(--teal-700)] leading-relaxed bg-[var(--teal-50)] rounded-xl p-4 border border-[var(--teal-100)]">
                  {post.summary}
                </p>
              )}

              {post.content && (
                <div className="text-[var(--foreground)] leading-loose text-base whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              <Button onClick={onClose} className="w-full bg-[var(--primary)] text-white mt-4">
                إغلاق
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-[var(--muted-foreground)]">لم يتم العثور على المنشور</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Media Center Page ───────────────────────────────────────────────────
export default function MediaCenter() {
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<PostCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const { data: posts = [], isLoading } = trpc.media.list.useQuery({
    type: typeFilter !== "all" ? typeFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    limit: 50,
    offset: 0,
    publishedOnly: true,
  });

  const filteredPosts = search
    ? posts.filter(p => p.title.includes(search) || p.summary?.includes(search) || p.content?.includes(search))
    : posts;

  const pinnedPosts = filteredPosts.filter(p => p.isPinned);
  const regularPosts = filteredPosts.filter(p => !p.isPinned);

  return (
    <div className="min-h-screen bg-[var(--background)]" dir="rtl">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[var(--teal-900)] via-[var(--teal-800)] to-[var(--teal-700)] py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-sm px-4 py-2 rounded-full mb-4">
            <Newspaper className="w-4 h-4" />
            المركز الإعلامي
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            آخر الأخبار والتنبيهات
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            تابع أحدث أخبار الحج والعمرة والخدمات الإسلامية — أخبار، تنبيهات، مقالات، وإعلانات
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 space-y-4 shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في الأخبار والمقالات..."
              className="pr-10 text-right"
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1"><Filter className="w-3 h-3" /> نوع المحتوى</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={typeFilter === "all" ? "default" : "outline"}
                onClick={() => setTypeFilter("all")}
                className={typeFilter === "all" ? "bg-[var(--primary)] text-white" : ""}
              >
                الكل
              </Button>
              {(Object.entries(TYPE_MAP) as [PostType, typeof TYPE_MAP[PostType]][]).map(([key, val]) => {
                const Icon = val.icon;
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={typeFilter === key ? "default" : "outline"}
                    onClick={() => setTypeFilter(key)}
                    className={typeFilter === key ? "bg-[var(--primary)] text-white" : ""}
                  >
                    <Icon className="w-3.5 h-3.5 ml-1" />
                    {val.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1"><Filter className="w-3 h-3" /> التصنيف</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={categoryFilter === "all" ? "default" : "outline"}
                onClick={() => setCategoryFilter("all")}
                className={categoryFilter === "all" ? "bg-[var(--primary)] text-white" : ""}
              >
                الكل
              </Button>
              {(Object.entries(CATEGORY_MAP) as [PostCategory, typeof CATEGORY_MAP[PostCategory]][]).map(([key, val]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={categoryFilter === key ? "default" : "outline"}
                  onClick={() => setCategoryFilter(key)}
                  className={categoryFilter === key ? "bg-[var(--primary)] text-white" : ""}
                >
                  {val.emoji} {val.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pinned Posts */}
        {!isLoading && pinnedPosts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-lg font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>المثبتة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedPosts.map(post => (
                <PostCard key={post.id} post={post} onClick={() => setSelectedPostId(post.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        {!isLoading && (
          <div className="space-y-4">
            {pinnedPosts.length > 0 && regularPosts.length > 0 && (
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[var(--primary)]" />
                <h2 className="text-lg font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  جميع المنشورات
                  <span className="text-sm font-normal text-[var(--muted-foreground)] mr-2">({filteredPosts.length} منشور)</span>
                </h2>
              </div>
            )}
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map(post => (
                  <PostCard key={post.id} post={post} onClick={() => setSelectedPostId(post.id)} />
                ))}
              </div>
            ) : !isLoading && filteredPosts.length === 0 && (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">لا توجد منشورات بهذا الفلتر</p>
                <p className="text-sm mt-1">جرب تغيير نوع المحتوى أو التصنيف</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPostId !== null && (
        <PostDetailModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}
    </div>
  );
}
