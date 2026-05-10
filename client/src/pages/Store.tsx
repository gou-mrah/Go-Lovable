import { usdToSar } from "@shared/const";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart, Star, Plus, Minus, Trash2, ArrowRight,
  Search, Package, Tag, CheckCircle, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocation } from "wouter";

interface CartItem {
  id: number;
  name: string;
  priceUSD: string;
  imageUrl?: string;
  quantity: number;
}

function ProductCard({ product, onAddToCart }: { product: any; onAddToCart: (p: any) => void }) {
  const [added, setAdded] = useState(false);
  const { format: formatPrice } = useCurrency();

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="luxury-card group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="badge-featured">Featured</span>
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              New
            </span>
          </div>
        )}
        {product.discount && (
          <div className="absolute bottom-3 right-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs text-[var(--teal-600)] font-medium uppercase tracking-wider mb-1 capitalize">
          {product.category?.replace(/_/g, " ")}
        </div>
        <h3 className="font-semibold text-[var(--teal-800)] text-sm leading-tight mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-[var(--muted-foreground)] mb-2 line-clamp-2">{product.description}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-[var(--gold)] text-[var(--gold)]" : "text-gray-200"}`}
              />
            ))}
            <span className="text-xs text-[var(--muted-foreground)] ml-1">({product.reviewCount || 0})</span>
          </div>
        )}

        {/* Stock */}
        {product.stock != null && product.stock < 10 && (
          <div className="text-xs text-red-500 font-medium mb-2">
            Only {product.stock} left in stock
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            {product.originalPriceUSD && (
              <div className="text-xs text-[var(--muted-foreground)] line-through">
                {formatPrice(Number(product.originalPriceUSD))}
              </div>
            )}
            <div className="text-lg font-bold text-[var(--teal-700)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {formatPrice(Number(product.priceUSD))}
            </div>
          </div>
          <Button
            onClick={handleAdd}
            size="sm"
            className={`gap-1.5 transition-all ${
              added
                ? "bg-green-500 hover:bg-green-500 text-white"
                : "bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white"
            }`}
          >
            {added ? (
              <><CheckCircle className="w-3.5 h-3.5" /> Added!</>
            ) : (
              <><ShoppingCart className="w-3.5 h-3.5" /> Add</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  items,
  onClose,
  onUpdateQty,
  onRemove,
}: {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [, navigate] = useLocation();
  const createOrder = trpc.store.createOrder.useMutation({
    onSuccess: (data) => {
      // Redirect to payment page with order details
      const totalSAR = usdToSar(total).toFixed(2);
      navigate(`/pay/order/${data.orderId}?amount=${totalSAR}&ref=${data.orderNumber}`);
    },
    onError: (err) => toast.error(err.message || "Order failed"),
  });

  const { format: formatPrice } = useCurrency();
  const total = items.reduce((sum, item) => sum + Number(item.priceUSD) * item.quantity, 0);

  if (checkoutStep === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-[var(--teal-800)] mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          جاري التحويل لصفحة الدفع...
        </h3>
        <p className="text-[var(--muted-foreground)] text-sm mb-6">
          سيتم تحويلك لإتمام الدفع عبر بوابة Moyasar الآمنة
        </p>
      </div>
    );
  }

  if (checkoutStep === "checkout") {
    return (
      <div>
        <h3 className="font-bold text-[var(--teal-800)] text-lg mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          Checkout
        </h3>
        <div className="space-y-3 mb-4">
          <div>
            <Label className="text-sm font-medium">Full Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" placeholder="Your name" />
          </div>
          <div>
            <Label className="text-sm font-medium">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" placeholder="your@email.com" />
          </div>
          <div>
            <Label className="text-sm font-medium">Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" placeholder="+44 7700 900000" />
          </div>
          <div>
            <Label className="text-sm font-medium">Shipping Address *</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" placeholder="Your address" />
          </div>
        </div>

        <div className="bg-[var(--teal-50)] rounded-xl p-3 mb-4 border border-[var(--teal-200)]">
          <div className="flex justify-between text-sm font-medium text-[var(--teal-800)]">
            <span>Order Total</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="flex-1">
            Back
          </Button>
          <Button
            onClick={() => {
              if (!form.name || !form.email || !form.address) {
                toast.error("Please fill in all required fields");
                return;
              }
              createOrder.mutate({
                items: items.map((i) => ({ productId: i.id, name: i.name, price: Number(i.priceUSD), quantity: i.quantity, imageUrl: i.imageUrl })),
                subtotalUSD: total.toFixed(2),
                totalUSD: total.toFixed(2),
                shippingAddress: {
                  name: form.name,
                  address: form.address,
                  city: "N/A",
                  country: "N/A",
                  zip: "N/A",
                },
              });
            }}
            disabled={createOrder.isPending}
            className="flex-1 bg-[var(--primary)] text-white"
          >
            {createOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Place Order"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold text-[var(--teal-800)] text-lg mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        Shopping Cart ({items.length} items)
      </h3>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)] text-sm">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-[var(--teal-50)] rounded-xl">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--teal-800)] truncate">{item.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{formatPrice(Number(item.priceUSD))}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-white border border-[var(--border)] flex items-center justify-center hover:bg-[var(--teal-50)]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-white border border-[var(--border)] flex items-center justify-center hover:bg-[var(--teal-50)]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-3 mb-4">
            <div className="flex justify-between text-base font-bold text-[var(--teal-800)]">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            onClick={() => setCheckoutStep("checkout")}
            className="w-full bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white font-semibold gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

const DEMO_PRODUCTS = [
  {
    id: 1, name: "طقم الإحرام الفاخر (2 قطعة)", category: "ihram", priceUSD: "45", isFeatured: true, isNew: false,
    description: "إحرام فاخر من القطن الناعم، مريح وخفيف للارتداء طوال أداء شعائر الحج والعمرة.",
    rating: 4.8, reviewCount: 124, stockQuantity: 50,
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80",
  },
  {
    id: 2, name: "سجادة صلاة فاخرة — تصميم الكعبة", category: "prayer_items", priceUSD: "35", isFeatured: true,
    description: "سجادة مخملية فاخرة بتصميم الكعبة المشرفة، تذكار مثالي من الحج والعمرة.",
    rating: 4.9, reviewCount: 89, stockQuantity: 30,
    imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80",
  },
  {
    id: 3, name: "ماء زمزم أصلي (5 لتر)", category: "zamzam", priceUSD: "25", isNew: true,
    description: "ماء زمزم أصلي من مكة المكرمة، معبأ ومعتمد.",
    rating: 5.0, reviewCount: 256, stockQuantity: 100,
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80",
  },
  {
    id: 4, name: "مسبحة فضية عيار 925", category: "prayer_items", priceUSD: "28", discount: 15,
    originalPriceUSD: "33", description: "مسبحة فضية فاخرة بـ 99 حبة، مع شرابة أنيقة.",
    rating: 4.7, reviewCount: 67, stockQuantity: 25,
    imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80",
  },
  {
    id: 5, name: "حقيبة الحاج المتكاملة", category: "accessories", priceUSD: "65", isFeatured: true, isNew: true,
    description: "طقم متكامل يشمل حزام الإحرام، سجادة سفر، زجاجة زمزم، ومستلزمات ضرورية.",
    rating: 4.6, reviewCount: 43, stockQuantity: 15,
    imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80",
  },
  {
    id: 6, name: "لوحة خط عربي إسلامي", category: "gifts", priceUSD: "40",
    description: "لوحة بسملة بالخط العربي، هدية رائعة للأحبة.",
    rating: 4.8, reviewCount: 34, stockQuantity: 20,
    imageUrl: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=400&q=80",
  },
  {
    id: 7, name: "عطر عود ليالي مكة", category: "perfumes", priceUSD: "55",
    description: "عطر عود سعودي أصيل، مستوحى من عبير مكة المكرمة.",
    rating: 4.9, reviewCount: 78, stockQuantity: 40,
    imageUrl: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=400&q=80",
  },
  {
    id: 8, name: "مصحف بالتجويد الملون", category: "books", priceUSD: "30", discount: 10,
    originalPriceUSD: "33", description: "مصحف شريف بالتلوين لتسهيل تعلم أحكام التجويد.",
    rating: 4.9, reviewCount: 112, stockQuantity: 60,
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80",
  },
];

const CATEGORIES = [
  { value: "all", label: "All Products", icon: "🛍️" },
  { value: "ihram", label: "Ihram", icon: "🕌" },
  { value: "prayer_items", label: "Prayer Items", icon: "📿" },
  { value: "zamzam", label: "Zamzam Water", icon: "💧" },
  { value: "accessories", label: "Accessories", icon: "🎒" },
  { value: "gifts", label: "Gifts", icon: "🎁" },
  { value: "perfumes", label: "Perfumes", icon: "🌹" },
  { value: "books", label: "Books", icon: "📖" },
];

export default function StorePage() {
  useSEO(SEO_CONFIGS.store);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "rating">("newest");
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("go-umrah-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem("go-umrah-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const { data: products, isLoading } = trpc.store.listProducts.useQuery({
    // category filter not supported by router directly, using client-side filter
    search: debouncedSearch || undefined,
    sortBy,
    limit: 24,
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    setTimeout(() => setDebouncedSearch(val), 400);
  };

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, priceUSD: product.priceUSD, imageUrl: product.imageUrl, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
    }
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const displayProducts = products && products.length > 0 ? products : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1600&q=85"
          alt="Islamic Store"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--teal-900)]/80 to-[var(--teal-900)]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            Islamic Essentials Store
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Pilgrimage Store
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            Premium Ihram, prayer items, Zamzam water, gifts, and everything you need for your sacred journey
          </p>
        </div>
      </div>

      {/* Sticky Header with Cart */}
      <div className="bg-white border-b border-[var(--border)] shadow-sm sticky top-16 z-30">
        <div className="container py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Best Rated</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setCartOpen(true)}
              className="relative bg-[var(--primary)] text-white gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                category === c.value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                  : "border-[var(--border)] bg-white text-[var(--teal-700)] hover:border-[var(--teal-300)]"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="luxury-card overflow-hidden">
                <div className="h-48 shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts ? (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              <strong>{displayProducts.length}</strong> products found
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">📋 Sample products shown. Add real products via the Admin Dashboard.</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {DEMO_PRODUCTS
                .filter((p) => category === "all" || p.category === category)
                .filter((p) => !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
                .map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <ShoppingCart className="w-5 h-5" />
              Your Cart
            </DialogTitle>
          </DialogHeader>
          <CartDrawer
            items={cartItems}
            onClose={() => setCartOpen(false)}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
