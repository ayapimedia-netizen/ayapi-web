"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAllSiteSettings } from "@/app/actions";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    getAllSiteSettings().then((res) => {
      if (res) setSiteSettings(res);
    });
  }, []);

  const formattedWaNumber = siteSettings.wa_number_formatted || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_FORMATTED || "+62 821-3444-730";
  const csEmail = siteSettings.cs_email || "ayapihr@gmail.com";
  const address = siteSettings.headquarter_address || "Jl. Tukad Pakerisan No.96, Dauh Puri Klod, Kec. Denpasar Barat, Kota Denpasar, Bali";


  // Hide Footer on links and admin pages
  if (
    pathname === "/links" ||
    pathname === "/link" ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  const handleSecretClick = () => {
    if (clickTimer) clearTimeout(clickTimer);

    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      router.push("/admin");
      setClickCount(0);
    } else {
      setClickCount(nextCount);
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 3000);
      setClickTimer(timer);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200/80 py-12 md:py-16 text-gray-900 relative overflow-hidden shadow-2xl">
      {/* Ambient Glow in Footer */}
      <div className="ambient-orb w-80 h-80 bg-brand-red/5 bottom-0 left-1/4 animate-orb-1"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-1 flex flex-col space-y-4">
            <div className="bg-brand-red p-3 rounded-xl inline-block shadow-md border border-brand-red/50 self-start">
              <Image
                src="/logo.png"
                alt="Ayapi Krispi Bakar Logo"
                width={140}
                height={78}
                className="w-[120px] h-auto"
              />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium">
              Ayapi Krispi Bakar menyajikan ayam krispi bakar kualitas premium dengan bumbu meresap sampai ke dalam. Renyah di luar, juicy di dalam.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider select-none">
                <svg className="w-3.5 h-3.5 text-emerald-600 fill-current shrink-0" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Halal Indonesia
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-50 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider select-none">
                <svg className="w-3.5 h-3.5 text-amber-600 fill-current shrink-0" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 00-.553.894v5.758a1 1 0 00.502.864l7 4a1 1 0 00.996 0l7-4a1 1 0 00.502-.864V5.974a1 1 0 00-.553-.894l-7-3zM9 13.586l-2.293-2.293a1 1 0 011.414-1.414L9 10.758l2.879-2.879a1 1 0 111.414 1.414L9 13.586z" />
                </svg>
                Merek HAKI
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black text-brand-red uppercase tracking-widest mb-4">Navigasi</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs text-gray-600 hover:text-brand-red font-medium transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-xs text-gray-600 hover:text-brand-red font-medium transition-colors duration-200">
                  Menu Kami
                </Link>
              </li>
              <li>
                <Link href="/kemitraan" className="text-xs text-gray-600 hover:text-brand-red font-medium transition-colors duration-200">
                  Kemitraan Franchise
                </Link>
              </li>
              <li>
                <Link href="/links" className="text-xs text-gray-600 hover:text-brand-red font-medium transition-colors duration-200">
                  Ayapi Link
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-xs text-gray-600 hover:text-brand-red font-medium transition-colors duration-200">
                  Hubungi Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xs font-black text-brand-red uppercase tracking-widest mb-4">Jam Operasional</h3>
            <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
              <li className="font-bold text-gray-900">Setiap Hari: 10:00 - 22:00 WITA</li>
              <li>Menerima Pesanan Partai Besar / Catering</li>
              <li className="text-brand-orange font-bold pt-1">⚡ Layanan WhatsApp Delivery Aktif</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-black text-brand-red uppercase tracking-widest mb-4">Kontak Kami</h3>
            <ul className="space-y-3 text-xs text-gray-600 font-medium">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-brand-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{formattedWaNumber}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{csEmail}</span>
              </li>

            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p
            onClick={handleSecretClick}
            className="cursor-default select-none hover:text-brand-red transition-colors"
            title="Ayapi Krispi Bakar"
          >
            &copy; {currentYear} Ayapi Krispi Bakar. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-red transition-colors duration-200">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-brand-red transition-colors duration-200">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
