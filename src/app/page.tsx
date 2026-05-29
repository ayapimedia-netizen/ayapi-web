"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMenuItems, MenuItem } from "@/app/actions";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
    alt: "Ayam Krispi Bakar Juicy",
    sub: "Menu Terlaris",
  },
  {
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    alt: "Ayam Geprek Krisbar Pedas",
    sub: "Sambal Korek Bawang Asli",
  },
  {
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    alt: "Outlet Kemitraan Premium Ayapi",
    sub: "Peluang Franchise Bisnis Kuliner",
  },
];

type Testimonial = {
  name: string;
  role: string;
  rating: number;
  review: string;
  initials: string;
  bgGradient: string;
};

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([
    {
      name: "Ayapi Krisbar Original",
      price: "Rp 22.000",
      description: "Ayam krispi renyah dibakar dengan balutan bumbu manis pedas smoky khas Ayapi.",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
      category: "krisbar",
    },
    {
      name: "Paket Krisbar Madu",
      price: "Rp 27.000",
      description: "Nasi hangat + Ayam krispi bakar saus madu manis gurih, lengkap dengan lalapan segar.",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
      category: "krisbar",
    },
    {
      name: "Paket Geprek Krisbar",
      price: "Rp 25.000",
      description: "Nasi hangat + Ayam krispi bakar yang digeprek dengan sambal korek bawang super pedas.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
      category: "geprek",
    },
  ]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const allItems = await getMenuItems();
        // Slicing first 3 items as featured menu items
        const featured = allItems.slice(0, 3);
        if (featured.length > 0) {
          setFeaturedItems(featured);
        }
      } catch (err) {
        console.error("Gagal memuat menu favorit:", err);
      }
    };
    fetchFeatured();
  }, []);

  // Auto advance hero slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonials: Testimonial[] = [
    {
      name: "Indra Kurniawan",
      role: "Mitra Franchise - Bandung",
      rating: 5,
      review: "Keputusan terbaik saya tahun lalu adalah bergabung menjadi mitra Ayapi. Modal awalnya sangat terjangkau, bumbu disuplai terpusat jadi rasa selalu konsisten. Kurang dari 5 bulan outlet saya sudah balik modal!",
      initials: "IK",
      bgGradient: "from-red-500 to-orange-500",
    },
    {
      name: "Siti Rahma",
      role: "Pelanggan Setia - Depok",
      rating: 5,
      review: "Ayam krispi bakar di sini bener-bener beda! Kulit luarnya garing renyah tapi dagingnya tetap juicy banget. Ditambah saus bakar madunya yang meresap sampai ke dalam daging. Langganan keluarga kami!",
      initials: "SR",
      bgGradient: "from-amber-500 to-yellow-500",
    },
    {
      name: "Rian Hidayat",
      role: "Pecinta Kuliner - Jakarta",
      rating: 5,
      review: "Paket Geprek Krisbar Ijonya juara banget! Pedas cabai ijonya segar gurih, rasa smoky ayam bakarnya dapet, dan porsinya bikin kenyang. Pesan lewat keranjang belanja web ini juga gampang banget, langsung masuk WA!",
      initials: "RH",
      bgGradient: "from-rose-500 to-red-600",
    },
  ];

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
    <div className="w-full max-w-none flex flex-col">
      {/* Hero Slideshow Section (Full Width, Edge-to-Edge) */}
      <section className="relative w-full max-w-none h-[500px] sm:h-[600px] md:h-[75vh] min-h-[480px] bg-brand-dark overflow-hidden flex items-center animate-fade-in-up group">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                idx === currentHeroSlide
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-105 pointer-events-none"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={idx === 0}
                className="object-cover"
                sizes="100vw"
              />
              {/* Premium dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
              {/* Extra vertical gradient for mobile readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>
            </div>
          ))}
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl text-left space-y-6 md:space-y-8">
            <span className="bg-brand-red text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block border border-brand-red/20 shadow-md">
              Franchise Kuliner Terbaik
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Ayam <span className="text-brand-yellow drop-shadow-sm">Krispi Bakar</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-medium leading-relaxed max-w-xl">
              Renyah di luar, juicy di dalam. Sensasi ayam krispi yang berpadu sempurna dengan bumbu bakar karamel smoky khas Ayapi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Link
                href="/menu"
                className="bg-brand-yellow hover:bg-[#e0a800] text-black font-extrabold uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center text-xs cursor-pointer"
              >
                Pesan Sekarang
              </Link>
              <Link
                href="/kemitraan"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all duration-300 text-center text-xs cursor-pointer"
              >
                Info Franchise
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Dot Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentHeroSlide ? "bg-brand-yellow w-6" : "bg-white/40 hover:bg-white"
              }`}
              title={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Left & Right Arrow Buttons (Hidden on mobile, hover-reveal on desktop) */}
        <button
          onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center bg-black/20 text-white opacity-0 group-hover:opacity-100 hover:bg-black/40 hover:border-white/40 transition-all cursor-pointer hidden md:flex"
          title="Slide Sebelumnya"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 rounded-full flex items-center justify-center bg-black/20 text-white opacity-0 group-hover:opacity-100 hover:bg-black/40 hover:border-white/40 transition-all cursor-pointer hidden md:flex"
          title="Slide Selanjutnya"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* USP Section */}
      <section className="bg-white py-16 md:py-24 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3">
              Keunggulan Kami
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
              Kenapa Harus Ayapi?
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 text-xs md:text-sm">
              Kami berkomitmen menyajikan kelezatan Ayam Krispi Bakar premium dengan mutu terjamin dan sistem bisnis kemitraan yang kuat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="bg-brand-light/40 border border-brand-red/5 rounded-3xl p-6 hover:shadow-lg hover:shadow-brand-red/5 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-base text-brand-dark mb-2">Bumbu Bakar Rahasia</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Balutan saus bakar manis gurih yang meresap sempurna dan terkaramelisasi secara presisi di atas panggangan.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-brand-light/40 border border-brand-red/5 rounded-3xl p-6 hover:shadow-lg hover:shadow-brand-red/5 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-base text-brand-dark mb-2">100% Segar & Halal</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Menggunakan bahan baku daging ayam segar pilihan bersertifikat resmi serta diolah dengan sanitasi yang ketat.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-brand-light/40 border border-brand-red/5 rounded-3xl p-6 hover:shadow-lg hover:shadow-brand-red/5 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-extrabold text-base text-brand-dark mb-2">Bisnis Kemitraan Kuat</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Model kemitraan waralaba yang teruji dengan biaya awal terjangkau, balik modal cepat (ROI tinggi), dan suplai bumbu terpusat.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-brand-light/40 border border-brand-red/5 rounded-3xl p-6 hover:shadow-lg hover:shadow-brand-red/5 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-base text-brand-dark mb-2">Pemesanan Sangat Mudah</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Pesan langsung via WhatsApp terintegrasi atau melalui platform pesan antar online terkemuka (GoFood, GrabFood, ShopeeFood).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="bg-brand-light py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">
              Menu Terfavorit
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 text-base md:text-lg">
              Pilihan menu terlaris yang paling banyak dicari dan dinikmati oleh para pelanggan setia kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {featuredItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-red/5 hover:-translate-y-1.5 transition-all duration-500 border border-gray-100 flex flex-col h-full group"
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
                    ⭐ Terfavorit
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
        </div>
      </section>

      {/* Short About Section */}
      <section className="bg-white py-16 md:py-24 border-t border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Berawal dari kecintaan kami terhadap kuliner khas Nusantara, Ayapi menghadirkan inovasi cita rasa baru: <strong>Ayam Krispi Bakar (Krisbar)</strong>. Kami menggabungkan kerenyahan luar biasa dari ayam goreng tepung krispi dengan kelezatan bumbu bakar manis pedas karamel khas resep rahasia keluarga.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                Diproses dengan bahan-bahan segar pilihan dan higienis, Ayapi berkomitmen menyajikan kelezatan berkelas bintang lima dengan harga merakyat. Setiap gigitan adalah petualangan rasa yang memanjakan lidah Anda.
              </p>
              <div className="pt-2">
                <Link
                  href="/kontak"
                  className="bg-brand-red hover:bg-[#a01c1c] text-white font-bold uppercase tracking-wider px-6 py-3 rounded-lg text-sm shadow-sm transition-all duration-200 inline-block"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="bg-white py-16 md:py-24 border-t border-b border-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
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
                  className="border border-gray-200/80 rounded-2xl overflow-hidden bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm md:text-base text-brand-dark transition-all duration-300 focus:outline-none cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className={`ml-4 text-brand-red transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] border-t border-gray-100 opacity-100 p-5 bg-white" : "max-h-0 opacity-0 pointer-events-none"
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
      <section className="bg-gray-50 py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Review Jujur</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Suara Pelanggan & Mitra</h2>
            <div className="h-1 w-12 bg-brand-red mx-auto rounded-full mt-3"></div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white rounded-3xl border border-gray-200/50 p-8 md:p-12 shadow-sm hover:shadow-md hover:border-brand-red/5 transition-all duration-300 relative space-y-6 min-h-[250px] flex flex-col justify-between">
            {/* SVG Quote Icon Background */}
            <span className="absolute top-6 right-8 text-gray-100/80 font-serif text-8xl pointer-events-none select-none">
              “
            </span>

            {/* Testimonial Content */}
            <div className="space-y-4">
              {/* Rating Stars */}
              <div className="flex gap-1 text-brand-yellow">
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed italic">
                &ldquo;{testimonials[activeTestimonial].review}&rdquo;
              </p>
            </div>

            {/* Reviewer Meta */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${testimonials[activeTestimonial].bgGradient} text-white font-black text-sm flex items-center justify-center shadow-inner`}>
                  {testimonials[activeTestimonial].initials}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-dark">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-xs text-gray-400 font-semibold">{testimonials[activeTestimonial].role}</p>
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

          {/* Dots Indicator */}
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

        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8d1c1c] via-brand-red to-[#a61e1e] text-white py-20 md:py-28">
        {/* Background Decorative Blurs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-black/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 md:space-y-8 relative z-10 animate-fade-in-up">
          <span className="bg-white/10 text-brand-yellow font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block border border-white/10">
            Peluang Bisnis Waralaba
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            Tertarik Menjadi Bagian dari Keluarga Ayapi?
          </h2>
          <p className="text-sm md:text-base text-red-50/90 max-w-2xl mx-auto leading-relaxed">
            Buka peluang usahamu sendiri bersama franchise Ayam Krispi Bakar terlaris dengan manajemen operasional mudah dan balik modal cepat!
          </p>
          <div className="pt-4">
            <Link
              href="/kemitraan"
              className="bg-brand-yellow hover:bg-[#e0a800] text-brand-dark font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 inline-block text-xs"
            >
              Pelajari Kemitraan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
