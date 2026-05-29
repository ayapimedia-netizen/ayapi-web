"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getGalleryItems, GalleryItem } from "@/app/actions";

export default function Gallery() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6287777652032";
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    {
      title: "Proses Pembakaran Ayam",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
      category: "Dapur",
    },
    {
      title: "Kerenyahan Khas Ayapi",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
      category: "Menu",
    },
    {
      title: "Bahan Rempah Segar Pilihan",
      image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
      category: "Bahan Baku",
    },
    {
      title: "Paket Krisbar Madu Lengkap",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
      category: "Menu",
    },
    {
      title: "Ayam Bakar Madu Smoky",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      category: "Menu",
    },
    {
      title: "Pelanggan Setia Ayapi",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
      category: "Outlet",
    },
    {
      title: "Sajian Hangat Krisbar",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      category: "Menu",
    },
    {
      title: "Grilling & Glazing",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
      category: "Dapur",
    },
    {
      title: "Momen Makan Bersama",
      image: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=600&q=80",
      category: "Outlet",
    },
  ]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const items = await getGalleryItems();
        if (items.length > 0) {
          setGalleryItems(items);
        }
      } catch (err) {
        console.error("Gagal memuat galeri:", err);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1 bg-brand-red/10 rounded-full inline-block mb-3">
            Galeri Visual Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">
            Galeri Ayapi
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 text-base md:text-lg">
            Kumpulan momen-momen terbaik di outlet kami, proses memasak higienis, serta detail kelezatan menu Ayam Krispi Bakar.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {galleryItems.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-50 border border-gray-100 shadow-sm"
            >
              {/* Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-w-640px) 100vw, (max-w-1024px) 50vw, 33vw"
              />

              {/* Overlay with info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-brand-yellow font-bold text-xs uppercase tracking-wider mb-1">
                  {item.category}
                </span>
                <h3 className="text-white font-extrabold text-lg tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 md:mt-24 bg-brand-light border border-gray-100 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-brand-dark mb-2">Ingin Mengunjungi Outlet Kami?</h3>
          <p className="text-gray-500 text-sm md:text-base mb-6 max-w-xl mx-auto">
            Temukan lokasi terdekat di kota Anda dan nikmati secara langsung kerenyahan dan rasa juicy luar biasa dari Ayam Krispi Bakar.
          </p>
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Ayapi, saya ingin menanyakan lokasi outlet terdekat.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-red hover:bg-[#a01c1c] text-white font-bold uppercase tracking-wider px-6 py-3 rounded-lg text-sm transition-all duration-200 inline-block shadow-sm hover:shadow-md"
          >
            Tanya Lokasi Terdekat
          </a>
        </div>
      </div>
    </div>
  );
}
