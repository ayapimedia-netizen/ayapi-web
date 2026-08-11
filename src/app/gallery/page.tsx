"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getGalleryItems, GalleryItem } from "@/app/actions";

export default function Gallery() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6287777652032";
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const categories = ["Semua", "Menu", "Outlet", "Dapur", "Bahan Baku"];

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const items = await getGalleryItems();
        setGalleryItems(items || []);
      } catch (err) {
        console.error("Gagal memuat galeri:", err);
      }
    };
    fetchGallery();
  }, []);

  const filteredItems = galleryItems.filter((item) => {
    return activeCategory === "Semua" || item.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="w-full relative overflow-hidden bg-grid-pattern-light min-h-screen py-16 md:py-24">
      {/* Background Ambient Glowing Orbs */}
      <div className="ambient-orb animate-orb-1 bg-brand-red w-72 h-72 top-20 left-10 opacity-[0.06]" />
      <div className="ambient-orb animate-orb-2 bg-brand-yellow w-80 h-80 bottom-20 right-10 opacity-[0.06]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-brand-red font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3.5">
            Galeri Visual Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4 tracking-tight">
            Galeri Ayapi
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-5"></div>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Kumpulan momen-momen terbaik di outlet kami, proses memasak higienis, serta detail kelezatan menu Ayam Krispi Bakar.
          </p>
        </div>

        {/* Categories Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12 animate-fade-in-up">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-brand-red to-[#e53935] text-white shadow-md shadow-brand-red/20 scale-[1.02]"
                    : "bg-white/60 hover:bg-white/90 border border-gray-200/80 text-brand-dark backdrop-blur-xs shadow-2xs"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-glass shadow-premium border border-white/40 hover-scale-premium hover:shadow-premium-hover transition-all duration-300"
            >
              {/* Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-w-640px) 100vw, (max-w-1024px) 50vw, 33vw"
              />

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-brand-yellow font-extrabold text-[10px] uppercase tracking-widest mb-1.5 px-2 py-0.5 bg-brand-yellow/10 rounded-md inline-block w-fit backdrop-blur-xs">
                  {item.category}
                </span>
                <h3 className="text-white font-extrabold text-base md:text-lg tracking-tight leading-snug">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-glass rounded-3xl border border-white/40 p-8 max-w-lg mx-auto shadow-premium">
            <p className="text-gray-500 font-medium text-xs">Belum ada foto untuk kategori ini.</p>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-16 md:mt-24 bg-white border border-gray-200/80 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-brand-red/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">Ingin Mengunjungi Outlet Kami?</h3>
            <p className="text-gray-600 text-xs md:text-sm mb-8 max-w-xl mx-auto leading-relaxed font-medium">
              Temukan lokasi terdekat di kota Anda dan nikmati secara langsung kerenyahan dan rasa juicy luar biasa dari Ayam Krispi Bakar.
            </p>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Ayapi, saya ingin menanyakan lokasi outlet terdekat.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-8 py-4 rounded-xl text-xs transition-all duration-200 inline-block shadow-md hover:shadow-lg scale-100 hover:scale-[1.02] cursor-pointer"
            >
              Tanya Lokasi Terdekat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
