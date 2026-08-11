"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Sparkles, TrendingUp, ShieldCheck, Award, ChevronRight, Store, Utensils, Star, ArrowRight, CheckCircle2, Users, Building2 } from "lucide-react";
import { getMenuItems, getBranches, getHeroSlides, getTestimonials, MenuItem, Branch, HeroSlide, Testimonial } from "@/app/actions";

// Fallback slides when database is empty
const defaultHeroSlides: HeroSlide[] = [
  {
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1786456689164-w1ok8v.webp",
    alt: "Ayam Krispi Bakar Juicy",
    badge: "🔥 KULINER FRANCHISE TERBAIK",
    title: "Aroma Smoky Juara,\nBisnis Kuliner Luar Biasa",
    sub: "Sensasi Ayam Krispi Bakar (Krisbar) premium yang renyah di luar, juicy di dalam. Menarik ribuan pelanggan harian, menghadirkan peluang investasi franchise dengan keuntungan cepat dan berkelanjutan.",
    button_text: "🍔 Lihat Menu Terlezat",
    button_link: "/menu",
    button2_text: "💼 Peluang Kemitraan",
    button2_link: "/kemitraan",
    sort_order: 0,
    is_active: true,
  },
  {
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1786456730256-g1ihmd.webp",
    alt: "Ayam Geprek Krisbar Pedas",
    badge: "🔥 MENU TERLARIS NYAMAN DI KANTONG",
    title: "Krispi Bakar Geprek,\nPedas Nampol Nikmat!",
    sub: "Kombinasi ayam krispi bakar saus pilihan digeprek dengan sambal korek bawang asli yang dibuat segar setiap hari. Lezatnya bikin ketagihan!",
    button_text: "🍔 Lihat Menu Terlezat",
    button_link: "/menu",
    button2_text: "💼 Peluang Kemitraan",
    button2_link: "/kemitraan",
    sort_order: 1,
    is_active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    alt: "Outlet Kemitraan Premium Ayapi",
    badge: "🔥 PELUANG EMAS FRANCHISE",
    title: "Gabung Kemitraan,\nModal Ringan Cepat Balik",
    sub: "Sistem bisnis auto-pilot yang transparan, bumbu rahasia tersuplai aman, pendampingan penuh dari tim berpengalaman. Raih omset puluhan juta per bulan!",
    button_text: "💼 Gabung Mitra Sekarang",
    button_link: "/kemitraan",
    button2_text: "📞 Hubungi Kami",
    button2_link: "/kontak",
    sort_order: 2,
    is_active: true,
  },
];

const defaultTestimonials: Testimonial[] = [
  {
    name: "Indra Kurniawan",
    role: "Mitra Franchise - Bandung",
    rating: 5,
    review: "Keputusan terbaik saya tahun lalu adalah bergabung menjadi mitra Ayapi. Modal awalnya sangat terjangkau, bumbu disuplai terpusat jadi rasa selalu konsisten. Kurang dari 5 bulan outlet saya sudah balik modal!",
    initials: "IK",
    bg_gradient: "from-red-500 to-orange-500",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "Siti Rahma",
    role: "Pelanggan Setia - Depok",
    rating: 5,
    review: "Ayam krispi bakar di sini bener-bener beda! Kulit luarnya garing renyah tapi dagingnya tetap juicy banget. Ditambah saus bakar madunya yang meresap sampai ke dalam daging. Langganan keluarga kami!",
    initials: "SR",
    bg_gradient: "from-amber-500 to-yellow-500",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "Rian Hidayat",
    role: "Pecinta Kuliner - Jakarta",
    rating: 5,
    review: "Paket Geprek Krisbar Ijonya juara banget! Pedas cabai ijonya segar gurih, rasa smoky ayam bakarnya dapet, dan porsinya bikin kenyang. Pesan lewat keranjang belanja web ini juga gampang banget, langsung masuk WA!",
    initials: "RH",
    bg_gradient: "from-rose-500 to-red-600",
    sort_order: 3,
    is_active: true,
  },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Data States
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Calculator State
  const [portionSales, setPortionSales] = useState(150); // Daily portions sold slider

  // Calculator Constants
  const AVG_PORTION_PRICE = 22000;
  const NET_PROFIT_MARGIN = 0.40; // 40% Net Profit Margin
  const FIXED_MONTHLY_OPEX = 10000000; // Rp 10.000.000 (rent, salaries, utility)
  const INITIAL_INVESTMENT = 45000000; // Rp 45.000.000 (standard franchise fee & setup package)

  // Calculator Derivations
  const dailyRevenue = portionSales * AVG_PORTION_PRICE;
  const monthlyRevenue = dailyRevenue * 30;
  const monthlyNetProfit = Math.max(0, (monthlyRevenue * NET_PROFIT_MARGIN) - FIXED_MONTHLY_OPEX);
  const estimatedRoiMonths = monthlyNetProfit > 0 ? INITIAL_INVESTMENT / monthlyNetProfit : 0;

  useEffect(() => {
    // Preload default hero slide images immediately on mount
    if (typeof window !== "undefined") {
      defaultHeroSlides.forEach((s) => {
        if (s.image) {
          const img = new window.Image();
          img.src = s.image;
        }
      });
    }

    // Fetch hero slides first for instant display
    getHeroSlides().then((slidesData) => {
      if (slidesData && slidesData.length > 0) {
        setHeroSlides(slidesData);
        if (typeof window !== "undefined") {
          slidesData.forEach((s) => {
            if (s.image) {
              const img = new window.Image();
              img.src = s.image;
            }
          });
        }
      }
    }).catch((err) => console.error("Error fetching slides:", err));

    getMenuItems().then((items) => setFeaturedItems(items.slice(0, 3))).catch((err) => console.error("Error fetching menu:", err));
    getBranches().then(setBranches).catch((err) => console.error("Error fetching branches:", err));
    getTestimonials().then((testimonialsData) => {
      if (testimonialsData && testimonialsData.length > 0) {
        setTestimonials(testimonialsData);
      }
    }).catch((err) => console.error("Error fetching testimonials:", err));
  }, []);

  // Auto advance hero slideshow
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const formatCurrency = (val: number): string => {
    return "Rp " + Math.round(val).toLocaleString("id-ID");
  };

  const faqs = [
    {
      question: "Apa keunikan utama Ayam Krispi Bakar (Krisbar) Ayapi?",
      answer: "Ayapi menggabungkan kerenyahan luar biasa dari kulit ayam goreng tepung krispi dengan cita rasa smoky mendalam hasil pembakaran saus karamel manis pedas gurih rahasia kami. Ini menghasilkan sensasi renyah sekaligus juicy dalam satu gigitan.",
    },
    {
      question: "Apakah menu Ayapi dijamin Halal dan Higienis?",
      answer: "Ya, 100% Halal. Kami hanya menggunakan daging ayam segar pilihan yang dipotong sesuai syariat Islam, serta diolah menggunakan bumbu-bumbu alami berkualitas tinggi di bawah pengawasan kebersihan yang sangat ketat.",
    },
    {
      question: "Bagaimana cara memesan Ayapi untuk acara pesta atau katering?",
      answer: "Anda dapat melakukan pemesanan partai besar/katering secara praktis dengan mengisi keranjang belanja pada halaman Menu website ini dan memilih opsi checkout WhatsApp untuk terhubung langsung dengan customer service kami.",
    },
    {
      question: "Apakah Ayapi membuka peluang kemitraan franchise?",
      answer: "Tentu! Kami membuka peluang kemitraan franchise waralaba dengan investasi awal yang sangat terjangkau, sistem SOP operasional yang mudah dijalankan, suplai bumbu terpusat, dan estimasi balik modal (ROI) yang cepat.",
    },
  ];

  return (
    <div className="w-full max-w-none flex flex-col bg-background">
      {/* Hero Slideshow Section (Full Width, Edge-to-Edge) */}
      <section className="relative w-full max-w-none h-[540px] sm:h-[640px] md:h-[85vh] min-h-[520px] bg-[#99000B] overflow-hidden flex items-center animate-fade-in group">
        {/* Background Slides & Foreground Content */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHeroSlide
                ? "opacity-100 pointer-events-auto z-10"
                : "opacity-0 pointer-events-none z-0"
                }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority
                loading="eager"
                unoptimized
                className={`object-cover transition-transform duration-[8000ms] ease-out ${idx === currentHeroSlide ? "scale-105" : "scale-100"
                  }`}
                sizes="100vw"
              />
              {/* Perfect Balanced Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/15"></div>

              {/* Ambient Glowing Orbs inside Hero */}
              <div className="ambient-orb w-[500px] h-[500px] bg-brand-red/15 top-1/4 -left-24 animate-orb-1"></div>
              <div className="ambient-orb w-[400px] h-[400px] bg-brand-yellow/10 bottom-10 right-10 animate-orb-2"></div>

              {/* Slide Text Content */}
              <div className="absolute inset-0 flex items-center pb-16 sm:pb-20 md:pb-28">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-10">
                  <div className={`max-w-2xl text-left space-y-4 sm:space-y-6 transition-all duration-1000 transform ${idx === currentHeroSlide ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}>

                    {/* Badge & Floating Live Status Pill */}
                    <div className="flex flex-wrap items-center gap-3">
                      {slide.badge && (
                        <span className="bg-brand-red/90 text-white font-extrabold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20 shadow-md backdrop-blur-md inline-flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                          {slide.badge}
                        </span>
                      )}

                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-brand-cream text-[11px] font-extrabold px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
                        5.0 (500+ Review)
                      </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] whitespace-pre-line drop-shadow-lg">
                      {slide.title}
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-brand-cream/90 font-medium leading-relaxed max-w-xl drop-shadow">
                      {slide.sub}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-start pt-3">
                      {slide.button_text && slide.button_link && (
                        <Link
                          href={slide.button_link}
                          className="bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 text-center text-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Utensils className="w-4 h-4" />
                          {slide.button_text}
                        </Link>
                      )}
                      {slide.button2_text && slide.button2_link && (
                        <Link
                          href={slide.button2_link}
                          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl backdrop-blur-md transition-all duration-300 text-center text-xs cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
                        >
                          <Building2 className="w-4 h-4" />
                          {slide.button2_text}
                        </Link>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dot Indicators */}
        <div className="absolute bottom-16 md:bottom-24 left-0 right-0 flex justify-center gap-2.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${idx === currentHeroSlide ? "bg-brand-yellow w-8 shadow-glow-amber scale-110" : "bg-white/40 hover:bg-white/80 w-2.5"
                }`}
              title={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Left & Right Arrow Buttons */}
        <button
          onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center bg-black/30 hover:bg-brand-red text-white opacity-0 group-hover:opacity-100 hover:border-brand-red transition-all duration-300 cursor-pointer hidden md:flex backdrop-blur-md shadow-2xl hover:scale-110"
          title="Slide Sebelumnya"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center bg-black/30 hover:bg-brand-red text-white opacity-0 group-hover:opacity-100 hover:border-brand-red transition-all duration-300 cursor-pointer hidden md:flex backdrop-blur-md shadow-2xl hover:scale-110"
          title="Slide Selanjutnya"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Social Proof & Traction Stats Bar */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:-mt-16">
        <div className="bg-white border border-gray-100/90 rounded-3xl p-6 md:p-8 shadow-2xl text-gray-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col justify-center py-2">
              <span className="text-3xl md:text-4xl font-black text-brand-red">{branches.length > 0 ? `${branches.length}+` : "2+"} Cabang</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Outlet Aktif & Ramai</span>
            </div>
            <div className="flex flex-col justify-center py-2 pt-6 md:pt-2">
              <span className="text-3xl md:text-4xl font-black text-brand-orange">15.000+</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Porsi Terjual / Bulan</span>
            </div>
            <div className="flex flex-col justify-center py-2 pt-6 md:pt-2">
              <span className="text-3xl md:text-4xl font-black text-brand-red">5 - 8 Bulan</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Rata-rata Balik Modal</span>
            </div>
            <div className="flex flex-col justify-center py-2 pt-6 md:pt-2">
              <span className="text-3xl md:text-4xl font-black text-brand-orange">100% Legal</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Halal MUI & Merek HAKI</span>
            </div>
          </div>
        </div>
      </div>

      {/* USP SECTION: HIGH-END BENTO GRID */}
      <section className="py-20 md:py-28 border-b border-gray-100 bg-white relative overflow-hidden">
        {/* Ambient Orbs */}
        <div className="ambient-orb w-96 h-96 bg-brand-red/5 top-8 left-12 animate-orb-1"></div>
        <div className="ambient-orb w-96 h-96 bg-brand-orange/5 bottom-8 right-12 animate-orb-2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-red font-extrabold text-xs uppercase tracking-widest px-4 py-2 bg-brand-red/10 rounded-full inline-flex items-center gap-2 mb-3 border border-brand-red/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              KEUNGGULAN BISNIS AYAPI
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Mengapa Memilih Ayapi Krispi Bakar?
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-brand-red to-brand-orange mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
              Perpaduan rasa bintang lima yang dicintai pasar dengan standarisasi operasional teruji untuk keuntungan maksimal mitra.
            </p>
          </div>

          {/* ASYMMETRIC BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Bento Card 1: Featured 2-Column Wide Card */}
            <div className="md:col-span-2 bento-card bg-gradient-to-br from-brand-red via-brand-maroon to-gray-900 text-white p-8 md:p-10 shadow-2xl border border-white/10 rounded-3xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-orange to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Flame className="w-7 h-7 text-white fill-white" />
                  </div>
                  <span className="bg-white/15 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-white/20">
                    Bumbu Rahasia Terpusat
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white group-hover:text-brand-orange transition-colors">
                  Cita Rasa Smoky Bakar Karamel Rahasia
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed max-w-xl font-medium">
                  Formula bumbu karamel manis pedas smoky diolah secara terpusat. Rasa konsisten 100% sama di seluruh cabang outlet tanpa memerlukan koki profesional!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-white/15 mt-8">
                <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Supply Bumbu Terjamin
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" /> SOP Tanpa Koki
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                  <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Cita Rasa Teruji
                </div>
              </div>
            </div>

            {/* Bento Card 2: 100% Halal & Segar */}
            <div className="bento-card bg-white border border-gray-100 p-8 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-2xl flex items-center justify-center mb-6 font-bold text-xl group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-brand-red" />
                </div>
                <span className="bg-brand-red/10 text-brand-red text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
                  100% Halal & Higienis
                </span>
                <h3 className="font-black text-xl text-gray-900 mb-3">Bahan Segar Terjamin</h3>
                <p className="text-gray-600 text-xs leading-relaxed font-medium">
                  Semua bahan baku ayam segar dan rempah alami bersertifikat Halal MUI serta diproses di bawah standar sanitasi tinggi.
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-6 text-[11px] font-extrabold text-brand-red flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-red" /> Siap Pasang & Aman Regulasi
              </div>
            </div>

            {/* Bento Card 3: BEP Balik Modal Cepat */}
            <div className="bento-card bg-white border border-gray-100 p-8 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mb-6 font-bold text-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-brand-orange" />
                </div>
                <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-3">
                  ROI Tinggi
                </span>
                <h3 className="font-black text-xl text-gray-900 mb-3">Balik Modal 5 - 8 Bulan</h3>
                <p className="text-gray-600 text-xs leading-relaxed font-medium">
                  Margin keuntungan bersih hingga 40% dengan biaya operasional yang efisien. Mempercepat masa pengembalian investasi mitra.
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-6 text-[11px] font-extrabold text-brand-orange flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-orange" /> Estimasi BEP Sangat Cepat
              </div>
            </div>

            {/* Bento Card 4: Support Operational 2-Col Wide */}
            <div className="md:col-span-2 bento-card bg-white border border-gray-100 p-8 md:p-10 shadow-xl hover:shadow-2xl rounded-3xl transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
              <div className="space-y-3 max-w-lg">
                <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-2xl flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-brand-red" />
                </div>
                <h3 className="font-black text-2xl text-gray-900">Pendampingan Full Operational & Marketing</h3>
                <p className="text-gray-600 text-xs leading-relaxed font-medium">
                  Tim pusat Ayapi siap mendampingi Anda mulai dari survey lokasi, pelatihan staf karyawan, penyediaan promo launching, hingga materi promosi sosmed berkala.
                </p>
              </div>

              <Link
                href="/kemitraan"
                className="bg-brand-red hover:bg-[#a01c1c] text-white font-black uppercase tracking-widest px-6 py-4 rounded-xl text-xs shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 transition-all duration-300 shrink-0 self-start md:self-center"
              >
                Pelajari Paket Kemitraan →
              </Link>
            </div>

          </div>
        </div>
      </section>


      {/* Featured Menu Section */}
      <section className="py-16 md:py-24 bg-grid-pattern-light bg-brand-light/35 relative overflow-hidden">
        {/* Ambient Orb */}
        <div className="ambient-orb w-96 h-96 bg-brand-red/5 top-12 left-1/4 animate-orb-1"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3">
              Cita Rasa Terpilih
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
              Menu Terfavorit Pelanggan
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 text-base md:text-lg">
              Kombinasi kerenyahan krispi dan kelezatan smoky yang terus membuat penikmat kuliner kembali lagi.
            </p>
          </div>

          {featuredItems.length === 0 ? (
            <div className="text-center py-12 bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 max-w-md mx-auto shadow-sm">
              <p className="text-gray-500 font-medium text-xs">Belum ada menu terfavorit yang ditampilkan saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {featuredItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-glass rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-hover hover-scale-premium border border-white/60 flex flex-col h-full group"
                >
                  <div className="relative w-full h-[220px] bg-gray-50 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-w-768px) 100vw, 33vw"
                    />
                    {/* Category Badge overlay */}
                    <span className="absolute top-4 left-4 bg-brand-red text-white text-[9px] font-black tracking-widest px-3 py-1.5 rounded-xl shadow-md uppercase z-10">
                      ⭐ TERFAVORIT
                    </span>

                    {item.is_available === false && (
                      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-brand-red text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg animate-pulse">
                          Habis
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-lg text-brand-dark leading-snug group-hover:text-brand-red transition-colors duration-200">
                        {item.name}
                      </h3>
                      <span className="bg-brand-yellow/15 text-[#b38000] font-extrabold text-sm px-3 py-1 rounded-xl whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>

                    {/* Spicy Pepper Indicator */}
                    {(item.name.toLowerCase().includes("geprek") || item.name.toLowerCase().includes("sambal") || item.name.toLowerCase().includes("original")) && (
                      <div className="flex items-center gap-1 mb-3" title="Tingkat Kepedasan">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Level Pedas:</span>
                        <span className="text-xs">{item.name.toLowerCase().includes("geprek") ? "🌶️🌶️🌶️" : "🌶️🌶️"}</span>
                      </div>
                    )}

                    <p className="text-gray-500 text-xs leading-relaxed mb-6 flex-grow">
                      {item.description}
                    </p>
                    <Link
                      href="/menu"
                      className="text-brand-red font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:gap-2 transition-all duration-200 self-start mt-auto"
                    >
                      Detail Menu
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INTERACTIVE FRANCHISE PROFITABILITY SIMULATOR (Investor Hook) */}
      <section className="bg-white text-gray-900 py-20 md:py-24 relative overflow-hidden border-b border-gray-100">
        {/* Background decorative elements */}
        <div className="ambient-orb w-[600px] h-[600px] bg-brand-red/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orb-1"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <span className="bg-brand-red/10 text-brand-red font-extrabold text-xs uppercase tracking-widest px-4 py-2 rounded-full inline-flex items-center gap-2 border border-brand-red/20">
                <TrendingUp className="w-3.5 h-3.5 text-brand-orange" />
                SIMULATOR INVESTASI B2B
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-gray-900">
                Simulasikan Keuntungan <br />Franchise Anda
              </h2>
              <div className="h-1.5 w-16 bg-brand-orange rounded-full"></div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
                Gunakan slider di samping untuk mensimulasikan penjualan harian outlet Ayapi Anda. Hitung langsung potensi pendapatan kotor, laba bersih bulanan, serta estimasi durasi balik modal berdasarkan modal paket standard kami sebesar <strong>{formatCurrency(INITIAL_INVESTMENT)}</strong>.
              </p>
              <div className="bg-white border border-gray-100 p-5 rounded-2xl text-xs text-gray-600 leading-relaxed space-y-2 shadow-lg">
                <p className="font-extrabold text-brand-red uppercase tracking-wider text-[10px]">Asumsi Keuangan:</p>
                <p>• Harga Rata-rata Porsi: <strong>Rp 22.000</strong></p>
                <p>• Margin Keuntungan Bersih: <strong>40%</strong> (setelah COGS & Royalty fee)</p>
                <p>• Biaya Operasional Tetap Bulanan: <strong>Rp 10.000.000</strong> (Sewa tempat, 2 staff gaji, & utilitas)</p>
              </div>
            </div>

            {/* Right Simulator Card Column */}
            <div className="lg:col-span-7 bg-white text-gray-900 p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100/90 flex flex-col justify-between space-y-8">

              {/* Slider Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    Target Penjualan Harian
                  </label>
                  <span className="bg-brand-red text-white text-sm font-black px-4 py-1.5 rounded-full shadow-md">
                    {portionSales} Porsi / Hari
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={portionSales}
                  onChange={(e) => setPortionSales(parseInt(e.target.value, 10))}
                  className="accent-brand-red w-full h-2.5 bg-gray-100 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>50 porsi</span>
                  <span>250 porsi</span>
                  <span>500 porsi</span>
                </div>
              </div>

              {/* Outputs Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Omzet Harian</span>
                  <span className="text-lg font-black text-brand-dark mt-1 block">
                    {formatCurrency(dailyRevenue)}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Omzet Bulanan</span>
                  <span className="text-lg font-black text-brand-dark mt-1 block">
                    {formatCurrency(monthlyRevenue)}
                  </span>
                </div>
                <div className="bg-brand-red/5 border border-brand-red/10 p-4.5 rounded-2xl">
                  <span className="text-[9px] text-brand-red font-bold uppercase tracking-wider block">Laba Bersih Bulanan</span>
                  <span className="text-lg font-black text-brand-red mt-1 block">
                    {formatCurrency(monthlyNetProfit)}
                  </span>
                </div>
              </div>

              {/* ROI Payback Period Gauge */}
              <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimasi Balik Modal (ROI)</span>
                  {monthlyNetProfit > 0 ? (
                    <span className="text-xl font-black text-brand-dark flex items-center gap-1.5 mt-1">
                      ⚡ ± {estimatedRoiMonths.toFixed(1)} Bulan
                      <span className="text-xs text-gray-400 font-semibold">(sangat cepat)</span>
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-red-500 mt-1 block">
                      ⚠️ Laba belum menutupi Opex. Tingkatkan penjualan.
                    </span>
                  )}
                </div>

                <Link
                  href="/kemitraan"
                  className="bg-brand-yellow hover:bg-[#e0a800] text-black font-black uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-xs text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  💼 Ambil Proposal Kemitraan
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE PHYSICAL OUTLETS SHOWCASE */}
      <section className="py-16 md:py-24 border-b border-gray-50 bg-grid-pattern relative overflow-hidden bg-white">
        {/* Ambient Orbs */}
        <div className="ambient-orb w-80 h-80 bg-brand-red/10 top-12 right-12 animate-orb-1"></div>
        <div className="ambient-orb w-80 h-80 bg-brand-yellow/10 bottom-12 left-12 animate-orb-2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3">
              Jejak Cabang Aktif
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
              Lokasi Outlet Fisik Ayapi
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 text-xs md:text-sm">
              Temukan kami di kota-kota terdekat Anda. Outlet operasional kami menjadi bukti nyata kesuksesan konsep bisnis Ayapi di lapangan.
            </p>
          </div>

          {branches.length === 0 ? (
            <div className="bg-brand-light/35 border border-gray-100 rounded-3xl p-16 text-center text-xs text-gray-400 font-bold shadow-inner">
              📍 Memuat lokasi outlet cabang Ayapi...
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-glass rounded-3xl border border-white/60 p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover hover-scale-premium transition-all duration-300 group w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.35rem)] min-w-[290px] max-w-sm"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
                      📍
                    </div>
                    <h3 className="font-extrabold text-lg text-brand-dark">{branch.name}</h3>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      Cabang Aktif & Layanan Delivery
                    </p>
                  </div>

                  {/* Delivery Links Container */}
                  <div className="border-t border-gray-50 pt-5 mt-6 space-y-2.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Pesan Online Via Ojol:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {branch.gofood ? (
                        <a
                          href={branch.gofood}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-50 hover:bg-green-100 text-green-700 font-bold text-[10px] uppercase py-2 rounded-xl text-center transition-colors block border border-green-200/50"
                        >
                          GoFood
                        </a>
                      ) : (
                        <span className="bg-gray-50 text-gray-300 font-semibold text-[10px] uppercase py-2 rounded-xl text-center block border border-gray-100 cursor-not-allowed">
                          -
                        </span>
                      )}

                      {branch.grabfood ? (
                        <a
                          href={branch.grabfood}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase py-2 rounded-xl text-center transition-colors block shadow-sm shadow-green-600/10"
                        >
                          GrabFood
                        </a>
                      ) : (
                        <span className="bg-gray-50 text-gray-300 font-semibold text-[10px] uppercase py-2 rounded-xl text-center block border border-gray-100 cursor-not-allowed">
                          -
                        </span>
                      )}

                      {branch.shopeefood ? (
                        <a
                          href={branch.shopeefood}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] uppercase py-2 rounded-xl text-center transition-colors block border border-orange-200/50"
                        >
                          ShopeeFood
                        </a>
                      ) : (
                        <span className="bg-gray-50 text-gray-300 font-semibold text-[10px] uppercase py-2 rounded-xl text-center block border border-gray-100 cursor-not-allowed">
                          -
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Short About Section */}
      <section className="bg-white py-16 md:py-24 border-t border-b border-gray-50 bg-grid-pattern-light relative overflow-hidden">
        {/* Ambient Orb */}
        <div className="ambient-orb w-80 h-80 bg-brand-red/5 top-20 left-1/4 animate-orb-2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left Image */}
            <div className="relative w-full h-[280px] sm:h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-lg order-2 md:order-1 bg-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="Tentang Ayapi Krispi Bakar"
                fill
                loading="lazy"
                className="object-cover"
                sizes="(max-w-768px) 100vw, 50vw"
              />
            </div>

            {/* Right Text */}
            <div className="space-y-6 order-1 md:order-2">
              <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Cita Rasa Nusantara</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark leading-tight">
                Cerita Rasa Ayapi
              </h2>
              <div className="h-1 w-12 bg-brand-red rounded-full"></div>
              <p className="text-gray-600 text-base leading-relaxed">
                Berawal dari kecintaan kami terhadap warisan kuliner khas Nusantara, Ayapi menghadirkan inovasi cita rasa baru: <strong>Ayam Krispi Bakar (Krisbar)</strong>. Kami menggabungkan renyahnya kulit ayam goreng tepung dengan bumbu bakar karamel smoky manis pedas gurih rahasia kami.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                Dengan manajemen logistik bumbu terpusat, Ayapi menjamin kemudahan pasokan bahan baku bagi seluruh mitra franchise, menjadikannya pilihan usaha kuliner dengan operasional sederhana namun memiliki daya tarik pasar yang sangat kuat.
              </p>
              <div className="pt-2">
                <Link
                  href="/kontak"
                  className="bg-brand-red hover:bg-[#a01c1c] text-white font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl text-xs shadow-sm transition-all duration-200 inline-block"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 md:py-24 border-b border-gray-100 bg-grid-pattern-light relative overflow-hidden bg-white">
        {/* Ambient Background Orbs */}
        <div className="ambient-orb animate-orb-1 bg-brand-red w-72 h-72 top-10 right-10 opacity-[0.05]" />
        <div className="ambient-orb animate-orb-2 bg-brand-yellow w-80 h-80 bottom-10 left-10 opacity-[0.05]" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 animate-fade-in-up">
            <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3">
              Pertanyaan Populer
            </span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Tanya Jawab (FAQ)</h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-3xl overflow-hidden bg-glass border transition-all duration-300 hover:shadow-premium ${isOpen ? "border-brand-red/35 ring-1 ring-brand-red/35" : "border-white/50"
                    }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-brand-dark transition-all duration-300 focus:outline-none cursor-pointer hover:text-brand-red"
                  >
                    <span>{faq.question}</span>
                    <span className={`ml-4 text-brand-red transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] border-t border-white/40 opacity-100 p-5 bg-white/40" : "max-h-0 opacity-0 pointer-events-none"
                      } overflow-hidden`}
                  >
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE CUSTOMER & PARTNER TESTIMONIALS */}
      <section className="py-16 md:py-24 border-b border-gray-100 bg-grid-pattern-light relative overflow-hidden bg-gray-50/50">
        {/* Ambient Orbs */}
        <div className="ambient-orb w-80 h-80 bg-brand-red/10 top-12 left-12 animate-orb-1"></div>
        <div className="ambient-orb w-80 h-80 bg-brand-yellow/10 bottom-12 right-12 animate-orb-2"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Review Mitra & Konsumen</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Suara Mereka Yang Sukses</h2>
            <div className="h-1 w-12 bg-brand-red mx-auto rounded-full mt-3"></div>
          </div>

          {/* Testimonial Card */}
          {testimonials.length > 0 && testimonials[activeTestimonial] ? (
            <div className="bg-glass rounded-3xl border border-white/60 p-8 md:p-12 shadow-premium hover:shadow-premium-hover transition-all duration-300 relative space-y-6 min-h-[250px] flex flex-col justify-between">
              {/* SVG Quote Icon Background */}
              <span className="absolute top-6 right-8 text-gray-100/85 font-serif text-8xl pointer-events-none select-none">
                “
              </span>

              {/* Testimonial Content */}
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex gap-1 text-brand-yellow">
                  {Array.from({ length: testimonials[activeTestimonial]?.rating || 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed italic">
                  &ldquo;{testimonials[activeTestimonial]?.review}&rdquo;
                </p>
              </div>

              {/* Reviewer Meta */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${testimonials[activeTestimonial]?.bg_gradient || "from-red-500 to-orange-500"} text-white font-black text-sm flex items-center justify-center shadow-inner`}>
                    {testimonials[activeTestimonial]?.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark">{testimonials[activeTestimonial]?.name}</h4>
                    <p className="text-xs text-gray-400 font-semibold">{testimonials[activeTestimonial]?.role}</p>
                  </div>
                </div>

                {/* Slider Arrows */}
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevTestimonial}
                    className="w-10 h-10 border border-gray-200 hover:border-brand-red/30 hover:text-brand-red rounded-xl flex items-center justify-center bg-white text-gray-500 transition-all cursor-pointer"
                    title="Testimoni Sebelumnya"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextTestimonial}
                    className="w-10 h-10 border border-gray-200 hover:border-brand-red/30 hover:text-brand-red rounded-xl flex items-center justify-center bg-white text-gray-500 transition-all cursor-pointer"
                    title="Testimoni Selanjutnya"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-glass rounded-3xl border border-white/60 p-8 text-center text-gray-400 text-xs font-medium">
              Belum ada testimoni yang ditampilkan saat ini.
            </div>
          )}

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeTestimonial === i ? "bg-brand-red w-6" : "bg-gray-300"
                    }`}
                  title={`Ke slide ${i + 1}`}
                ></button>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white border border-gray-100/90 rounded-3xl p-10 md:p-14 shadow-2xl text-center space-y-6 md:space-y-8">
            <span className="bg-brand-red/10 text-brand-red font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-brand-red/20">
              <Building2 className="w-3.5 h-3.5 text-brand-red" />
              PELUANG FRANCHISE WARALABA
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto text-gray-900">
              Tertarik Mengembangkan Outlet Bersama Kami?
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
              Dapatkan hak lisensi merek, pasokan bumbu karamel terpusat, SOP training karyawan, dan pendampingan pemasaran berkelanjutan untuk sukses bersama.
            </p>
            <div className="pt-4">
              <Link
                href="/kemitraan"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 text-xs"
              >
                <Building2 className="w-4 h-4" />
                Pelajari Kemitraan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
