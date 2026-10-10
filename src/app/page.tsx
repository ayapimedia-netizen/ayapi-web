"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { Flame, Sparkles, Utensils, Star, ArrowRight, CheckCircle2, Building2, Tag, Gift, X, ExternalLink } from "lucide-react";
import { getMenuItems, getBranches, getHeroSlides, MenuItem, Branch, HeroSlide } from "@/app/actions";

// Fallback slides when database is empty (exact 5 slides requested)
const defaultHeroSlides: HeroSlide[] = [
  {
    image: "/hero/slide-1-happy.jpg",
    alt: "Ayapi Bikin Happy",
    badge: "🎉 SEKALI COBA SUSAH BERHENTI",
    title: "Ayapi Bikin Happy.\nSekali Coba Susah Berhenti!",
    sub: "Ayam Krispi Bakar yang renyah diluar, juicy di dalam, dengan rasa yang bikin makan jadi lebih happy!",
    button_text: "🍔 Pesan Menu Sekarang",
    button_link: "/menu",
    button2_text: "📍 Lokasi Outlet",
    button2_link: "/#cabang",
    sort_order: 1,
    is_active: true,
  },
  {
    image: "/hero/slide-2-mitra.jpg",
    alt: "Gabung Kemitraan Ayapi",
    badge: "💼 PELUANG BISNIS KULINER",
    title: "Gabung Kemitraan Ayapi\nFleksibel, Dibantu dari A-Z",
    sub: "Mulai dari persiapan outlet, operasional hingga pendampingan bisnis. Bahkan jika kamu tidak punya banyak waktu untuk pengelolaan outlet, Ayapi memiliki system management untuk membantu menjalankannya.",
    button_text: "💼 Pelajari Kemitraan",
    button_link: "/kemitraan",
    button2_text: "📞 Konsultasi Tim Ahli",
    button2_link: "/kontak",
    sort_order: 2,
    is_active: true,
  },
  {
    image: "/hero/slide-3-krisbar.jpg",
    alt: "Ayam Krispi Bakar Smoky",
    badge: "🔥 PELOPOR AYAM KRISPI BAKAR",
    title: "Ayam Krispi Bakar\nKrispi di Luar, Juicy di Dalam",
    sub: "Bukan dengan sekedar ayam krispi. Perpaduan tekstur renyah, ayam juicy, dan aroma bakaran yang menjadi ciri khas Ayapi.",
    button_text: "🍔 Lihat Daftar Menu",
    button_link: "/menu",
    button2_text: "💼 Info Kemitraan",
    button2_link: "/kemitraan",
    sort_order: 3,
    is_active: true,
  },
  {
    image: "/hero/slide-4-locations.jpg",
    alt: "Ayapi Ada di Dekat Kamu",
    badge: "📍 CABANG OUTLET & ONLINE",
    title: "Ayapi Ada di Dekat Kamu 📍\nMakan Langsung atau Pesan Online",
    sub: "Temukan outlet Ayapi terdekat dan nikmati menu favoritmu. Tersedia untuk makan ditempat maupun pemesanan online.",
    button_text: "📍 Cari Outlet Terdekat",
    button_link: "/#cabang",
    button2_text: "🍔 Order Online",
    button2_link: "/menu",
    sort_order: 4,
    is_active: true,
  },
  {
    image: "/hero/slide-5-delivery.jpg",
    alt: "Lagi Mager? Free Delivery!",
    badge: "⚡ PROMO DELIVERY CEPAT",
    title: "Lagi Mager? Free Delivery!\nNikmati Tanpa Perlu Keluar Rumah",
    sub: "Pesan menu favoritmu dan nikmati Ayapi dari rumah. Cek ketersediaan promo dan area delivery melalui Whatsapp kami.",
    button_text: "🛵 Chat Delivery WhatsApp",
    button_link: "https://wa.me/628213444730?text=Halo%20Ayapi!%20Saya%20mau%20pesan%20Free%20Delivery",
    button2_text: "🍔 Lihat Menu",
    button2_link: "/menu",
    sort_order: 5,
    is_active: true,
  },
];

type PromoItem = {
  id: string;
  badge: string;
  title: string;
  desc: string;
  image: string;
  bannerImage: string;
  ctaText: string;
  actionType: "modal" | "link";
  linkUrl?: string;
  details: {
    highlight: string;
    description: string;
    points: string[];
    actionButtonText?: string;
    actionButtonUrl?: string;
    showQrCode?: boolean;
  };
};

const promoItems: PromoItem[] = [
  {
    id: "free-delivery",
    badge: "🛵 PROMO DELIVERY",
    title: "FREE DELIVERY",
    desc: "Nikmati Ayapi tanpa perlu keluar rumah",
    image: "/promos/promo-free-delivery.jpg",
    bannerImage: "/promos/promo-free-delivery.jpg",
    ctaText: "See More",
    actionType: "modal",
    details: {
      highlight: "Gratis Ongkir Langsung ke Pintu Rumahmu!",
      description: "Pesan menu favoritmu dan nikmati Ayapi dari rumah tanpa biaya ongkir. Cek ketersediaan promo dan area jangkauan delivery melalui WhatsApp kami.",
      points: [
        "Pesan langsung tanpa aplikasi ojol pihak ketiga",
        "Ayam tiba dalam keadaan hangat, renyah, dan fresh",
        "Tersedia untuk area delivery terdekat outlet Ayapi",
      ],
      actionButtonText: "Pesan via WhatsApp Delivery",
      actionButtonUrl: "https://wa.me/628213444730?text=Halo%20Ayapi!%20Saya%20mau%20pesan%20menu%20Free%20Delivery",
    },
  },
  {
    id: "tetangga-ayapi",
    badge: "🌴 KHUSUS KTP JIMBARAN",
    title: "TETANGGA AYAPI",
    desc: "Upgrade minuman khusus KTP Jimbaran",
    image: "/promos/promo-tetangga-ayapi.jpg",
    bannerImage: "/promos/promo-tetangga-ayapi.jpg",
    ctaText: "See More",
    actionType: "modal",
    details: {
      highlight: "Teman Santay Andalan Khusus Tetangga Jimbaran!",
      description: "Apresiasi kami untuk warga sekitar! Dapatkan GRATIS upgrade minuman setiap pembelian menu ayam Ayapi cukup dengan menunjukkan KTP Jimbaran Anda.",
      points: [
        "Cukup tunjukkan KTP beralamat Jimbaran saat memesan",
        "Gratis upgrade ke Teh Manis Jumbo atau varian minuman favorit",
        "Berlaku untuk Dine-in & Take Away di outlet Ayapi Jimbaran",
      ],
      actionButtonText: "Cek Lokasi Outlet Jimbaran",
      actionButtonUrl: "/#cabang",
    },
  },
  {
    id: "spesial-pelajar",
    badge: "🎓 PROMO PELAJAR & MAHASISWA",
    title: "SPESIAL UNTUK PELAJAR",
    desc: "Nasi + ayam hanya 15RB!",
    image: "/promos/promo-spesial-pelajar.jpg",
    bannerImage: "/promos/promo-spesial-pelajar.jpg",
    ctaText: "See More",
    actionType: "modal",
    details: {
      highlight: "Porsi Kenyang, Sambal Mantap, Cuma 15RB!",
      description: "Makan kenyang tanpa bikin kantong jebol! Paket hemat nasi pulen hangat + ayam renyah + Es Teh manis segar khusus untuk kamu para pelajar dan mahasiswa.",
      points: [
        "Paket lengkap Nasi + Ayam Gurih + Es Teh Manis",
        "Hanya Rp 15.000 (harga khusus pelajar)",
        "Tunjukkan kartu pelajar/mahasiswa atau kenakan seragam",
      ],
      actionButtonText: "Lihat Semua Menu",
      actionButtonUrl: "/menu",
    },
  },
  {
    id: "paket-ulang-tahun",
    badge: "🎂 EVENT & PARTY",
    title: "PAKET ULANG TAHUN",
    desc: "Rayakan hari istimewa Bersama kami",
    image: "/promos/promo-paket-ulang-tahun.jpg",
    bannerImage: "/promos/promo-paket-ulang-tahun.jpg",
    ctaText: "See More",
    actionType: "modal",
    details: {
      highlight: "Rayakan Hari Istimewa Penuh Keceriaan Bersama Ayapi!",
      description: "Bikin pesta ulang tahun makin seru dengan paket hidangan ayam krisbar, dekorasi balon meriah, dan bingkisan spesial dari Ayapi.",
      points: [
        "Paket makanan praktis dan higienis untuk teman & keluarga",
        "Bisa pesan untuk acara di outlet atau diantar langsung ke lokasi pesta",
        "Scan barcode atau klik tombol di bawah untuk konsultasi paket dengan tim kami",
      ],
      actionButtonText: "Chat WhatsApp Kemitraan & Event",
      actionButtonUrl: "https://wa.me/628213444730?text=Halo%20Tim%20Ayapi!%20Saya%20ingin%20tanya%20detail%20Paket%20Ulang%20Tahun",
      showQrCode: true,
    },
  },
  {
    id: "kemitraan",
    badge: "💼 BISNIS KULINER",
    title: "KEMITRAAN",
    desc: "Dapatkan harga spesial untuk kemitraan",
    image: "/promos/promo-kemitraan.jpg",
    bannerImage: "/promos/promo-kemitraan.jpg",
    ctaText: "See More",
    actionType: "link",
    linkUrl: "/kemitraan",
    details: {
      highlight: "Peluang Usaha Kuliner Menguntungkan",
      description: "Sesuaikan model kemitraan Anda. Mulai dari Rombong Express praktis hingga Restoran modern dengan promo investasi spesial mulai 15 Juta.",
      points: [
        "Sistem SOP teruji & operasional tanpa koki",
        "Bumbu rahasia disuplai terpusat",
        "Estimasi BEP balik modal cepat 5 - 8 bulan",
      ],
      actionButtonText: "Buka Halaman Kemitraan",
      actionButtonUrl: "/kemitraan",
    },
  },
  {
    id: "paket-keluarga",
    badge: "🍗 PAKET RAME-RAME",
    title: "PAKET KELUARGA & BUCKET",
    desc: "Makan kenyang bareng keluarga & teman lebih hemat",
    image: "/promos/promo-paket-keluarga.jpg",
    bannerImage: "/promos/promo-paket-keluarga.jpg",
    ctaText: "See More",
    actionType: "modal",
    details: {
      highlight: "Kenyang Rame-Rame, Makin Akrab Bareng Ayapi!",
      description: "Pilihan pas untuk kumpul keluarga, rekan kerja, atau nobar! Dapatkan 1 Bucket Ayam Krisbar renyah lengkap dengan porsi nasi dan es teh jumbo dengan harga spesial.",
      points: [
        "1 Bucket Isi 8 Potong Ayam Krispi Renyah Gurih",
        "Lengkap dengan 4 Nasi Putih + 4 Es Teh Manis Segar",
        "Ekstra sambal pilihan (Sambal Korek / Sambal Krisbar)",
      ],
      actionButtonText: "Pesan Paket Rame-Rame via WhatsApp",
      actionButtonUrl: "https://wa.me/628213444730?text=Halo%20Ayapi!%20Saya%20ingin%20pesan%20Paket%20Rame-Rame%20Keluarga",
    },
  },
];

export default function Home() {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Promo Modal State
  const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Data States
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    // Generate QR code for WhatsApp Kemitraan / Birthday reservation
    QRCode.toDataURL(
      "https://wa.me/628213444730?text=Halo%20Tim%20Ayapi!%20Saya%20ingin%20tanya%20detail%20Paket%20Ulang%20Tahun%20dan%20Kemitraan",
      {
        width: 260,
        margin: 1,
        color: { dark: "#99000B", light: "#FFFFFF" },
      }
    )
      .then(setQrCodeUrl)
      .catch((err) => console.error("QR Code generation error:", err));

    // Fetch hero slides
    getHeroSlides()
      .then((slidesData) => {
        if (slidesData && slidesData.length > 0) {
          setHeroSlides(slidesData);
        }
      })
      .catch((err) => console.error("Error fetching slides:", err));

    getMenuItems()
      .then((items) => {
        if (items && items.length > 0) {
          setFeaturedItems(items.slice(0, 3));
        } else {
          // Default fallbacks with real images
          setFeaturedItems([
            {
              name: "Paket Ayam Krispi Bakar (Krisbar)",
              price: "Rp 22.000",
              description: "Ayam krispi bakar bumbu karamel smoky rahasia Ayapi + Nasi hangat pulen + Lalapan segar.",
              category: "utama",
              image: "/hero/slide-3-krisbar.jpg",
            },
            {
              name: "Paket Viral 1 (Ayam Biasa / Sayap)",
              price: "Rp 16.000",
              description: "Nasi hangat pulen + Ayam goreng renyah bumbu marinasi khas + Sambal korek bawang segar.",
              category: "utama",
              image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1786456730256-g1ihmd.webp",
            },
            {
              name: "Paket FC 1 + Es Teh",
              price: "Rp 15.000",
              description: "Paket Pelajar Hemat: Paha bawah / sayap renyah + Nasi putih + Es teh manis segar.",
              category: "utama",
              image: "/promos/promo-spesial-pelajar.jpg",
            },
          ]);
        }
      })
      .catch((err) => console.error("Error fetching menu:", err));

    getBranches()
      .then(setBranches)
      .catch((err) => console.error("Error fetching branches:", err));
  }, []);

  // Auto advance hero slideshow
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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
      question: "Bagaimana cara memesan Ayapi untuk Free Delivery atau Acara Pesta?",
      answer: "Anda dapat memesan langsung melalui tombol WhatsApp di website ini. Untuk free delivery atau paket catering/ulang tahun, tim customer service kami akan melayani dan mengkonfirmasi pesanan Anda dengan cepat.",
    },
    {
      question: "Bagaimana cara bergabung dalam peluang kemitraan franchise Ayapi?",
      answer: "Anda dapat membuka menu Kemitraan di website ini untuk melihat detail paket Rombong Express maupun Resto (mulai promo 15 Juta), mengunduh proposal PDF resmi, dan konsultasi langsung bersama tim kemitraan kami.",
    },
  ];

  return (
    <div className="w-full max-w-none flex flex-col bg-background">
      {/* Hero Slideshow Section (Full Width, Edge-to-Edge) */}
      <section className="relative w-full max-w-none min-h-[600px] sm:min-h-[660px] md:min-h-[600px] md:h-[85vh] bg-[#99000B] overflow-hidden flex items-center animate-fade-in group">
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
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
                unoptimized
                className={`object-cover transition-transform duration-[8000ms] ease-out ${idx === currentHeroSlide ? "scale-105" : "scale-100"
                  }`}
                sizes="100vw"
              />
              {/* Perfect Balanced Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30"></div>

              {/* Ambient Glowing Orbs inside Hero */}
              <div className="ambient-orb w-[500px] h-[500px] bg-brand-red/15 top-1/4 -left-24 animate-orb-1"></div>
              <div className="ambient-orb w-[400px] h-[400px] bg-brand-yellow/10 bottom-10 right-10 animate-orb-2"></div>

              {/* Slide Text Content */}
              <div className="absolute inset-0 flex items-center pt-24 pb-14 sm:pt-28 sm:pb-16 md:py-0">
                <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 w-full relative z-10">
                  <div className={`max-w-2xl text-left space-y-3.5 sm:space-y-6 transition-all duration-1000 transform ${idx === currentHeroSlide ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}>

                    {/* Badge & Floating Live Status Pill */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      {slide.badge && (
                        <span className="bg-brand-red/90 text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-widest px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-md backdrop-blur-md inline-flex items-center gap-1.5 sm:gap-2">
                          <Flame className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
                          {slide.badge}
                        </span>
                      )}

                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-brand-cream text-[10px] sm:text-[11px] font-extrabold px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
                        5.0 (500+ Review)
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] whitespace-pre-line drop-shadow-lg">
                      {slide.title}
                    </h1>

                    <p className="text-xs sm:text-base md:text-xl text-brand-cream/90 font-medium leading-relaxed max-w-xl drop-shadow line-clamp-3 sm:line-clamp-none">
                      {slide.sub}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-start pt-1 sm:pt-3">
                      {slide.button_text && slide.button_link && (
                        <Link
                          href={slide.button_link}
                          className="bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-xl hover:scale-105 transition-all duration-300 text-center text-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Utensils className="w-4 h-4" />
                          {slide.button_text}
                        </Link>
                      )}
                      {slide.button2_text && slide.button2_link && (
                        <Link
                          href={slide.button2_link}
                          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-extrabold uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl backdrop-blur-md transition-all duration-300 text-center text-xs cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
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
        <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${idx === currentHeroSlide ? "bg-brand-yellow w-7 shadow-glow-amber scale-110" : "bg-white/40 hover:bg-white/80 w-2"
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

      {/* PROMO AYAPI SECTION (Replaced Keunggulan Bisnis Ayapi Bento Grid) */}
      <section className="py-20 md:py-28 border-b border-gray-100 bg-white relative overflow-hidden" id="promo">
        {/* Ambient Orbs */}
        <div className="ambient-orb w-96 h-96 bg-brand-red/5 top-8 left-12 animate-orb-1"></div>
        <div className="ambient-orb w-96 h-96 bg-brand-orange/5 bottom-8 right-12 animate-orb-2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-red font-extrabold text-xs uppercase tracking-widest px-4 py-2 bg-brand-red/10 rounded-full inline-flex items-center gap-2 mb-3 border border-brand-red/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              PROMO AYAPI SPESIAL
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              Promo Menarik Untuk Anda
            </h2>
            <div className="h-1.5 w-20 bg-gradient-to-r from-brand-red to-brand-orange mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
              Nikmati beragam penawaran hemat mulai dari Free Delivery, upgrade minuman, paket pelajar, perayaan ulang tahun, hingga promo kemitraan outlet.
            </p>
          </div>

          {/* PROMO CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {promoItems.map((promo) => (
              <div
                key={promo.id}
                className="bento-card bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden h-full"
              >
                <div className="flex flex-col flex-grow">
                  {/* Thumbnail / Visual */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 bg-gray-100 border border-gray-100 shrink-0 shadow-inner">
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                    <span className="absolute top-3 left-3 bg-brand-red/95 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {promo.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-brand-red transition-colors line-clamp-1">
                    {promo.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium">
                    {promo.desc}
                  </p>
                </div>

                <div className="pt-5 border-t border-gray-100 mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-brand-red uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Promo Spesial</span>
                  </span>

                  {promo.actionType === "link" ? (
                    <Link
                      href={promo.linkUrl || "/kemitraan"}
                      className="inline-flex items-center gap-1.5 bg-brand-red hover:bg-[#80000a] text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                      <span>See More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setSelectedPromo(promo)}
                      className="inline-flex items-center gap-1.5 bg-brand-red hover:bg-[#80000a] text-white font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                      <span>See More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Section (Cita Rasa Terpilih) */}
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

          <div className="flex flex-wrap justify-center gap-8 md:gap-10">
            {featuredItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 w-full md:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.75rem)] max-w-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Favorit
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-brand-dark group-hover:text-brand-red transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 text-justify line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-base font-black text-brand-red">
                      {item.price}
                    </span>
                    <Link
                      href="/menu"
                      className="bg-brand-red hover:bg-[#80000a] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all hover:scale-105"
                    >
                      Pesan Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-brand-dark font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-xl border border-gray-200 shadow-md transition-all hover:scale-105"
            >
              <span>Lihat Semua Menu Ayapi</span>
              <ArrowRight className="w-4 h-4 text-brand-red" />
            </Link>
          </div>
        </div>
      </section>

      {/* ACTIVE PHYSICAL OUTLETS SHOWCASE (Jejak Cabang Aktif) */}
      <section className="py-16 md:py-24 border-b border-gray-50 bg-grid-pattern relative overflow-hidden bg-white" id="cabang">
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
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-glass rounded-3xl border border-white/60 p-6 flex flex-col justify-between shadow-premium hover:shadow-premium-hover hover-scale-premium transition-all duration-300 group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md"
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
                  <div className="border-t border-gray-100/60 pt-5 mt-6 space-y-2.5">
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

      {/* FAQ Accordion Section (Pindah ke paling bawah homepage) */}
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

      {/* PROMO DETAIL POP-UP MODAL */}
      {selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPromo(null)}
          ></div>

          <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full z-10 shadow-2xl border border-gray-100 relative animate-fade-in max-h-[90vh] flex flex-col">
            {/* Modal Header & Close Button */}
            <div className="relative w-full h-52 sm:h-64 bg-gray-100 shrink-0">
              <Image
                src={selectedPromo.bannerImage}
                alt={selectedPromo.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              <button
                onClick={() => setSelectedPromo(null)}
                className="absolute top-4 right-4 text-white hover:text-brand-yellow p-2 rounded-full bg-black/40 hover:bg-black/70 transition-all cursor-pointer z-10"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="bg-brand-red text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md inline-block">
                  {selectedPromo.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-md">
                  {selectedPromo.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5">
              <div className="space-y-2">
                <h4 className="font-black text-lg text-brand-dark">
                  {selectedPromo.details.highlight}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {selectedPromo.details.description}
                </p>
              </div>

              {/* Bullet points */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4.5 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Syarat & Ketentuan Promo:
                </span>
                <ul className="space-y-2">
                  {selectedPromo.details.points.map((pt, i) => (
                    <li key={i} className="flex items-start text-xs text-gray-600 gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                      <span className="leading-snug">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* QR Barcode for Birthday & WhatsApp */}
              {selectedPromo.details.showQrCode && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  {qrCodeUrl ? (
                    <div className="p-2 bg-white rounded-xl shadow-md border border-amber-200 shrink-0">
                      <Image
                        src={qrCodeUrl}
                        alt="Scan QR Barcode WhatsApp"
                        width={110}
                        height={110}
                        className="w-24 h-24"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-white border border-dashed rounded-xl flex items-center justify-center text-xs text-gray-400">
                      QR Barcode
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-red bg-white px-2.5 py-0.5 rounded-full border border-brand-red/20 inline-block">
                      Scan Barcode WhatsApp
                    </span>
                    <h5 className="font-extrabold text-xs text-gray-900">Reservasi Event & Pesta Ulang Tahun</h5>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Arahkan kamera HP Anda ke barcode ini untuk langsung terhubung ke WhatsApp reservasi kami.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {selectedPromo.details.actionButtonText && selectedPromo.details.actionButtonUrl && (
                <div className="pt-2">
                  <a
                    href={selectedPromo.details.actionButtonUrl}
                    target={selectedPromo.details.actionButtonUrl.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="w-full bg-brand-red hover:bg-[#80000a] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>{selectedPromo.details.actionButtonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
