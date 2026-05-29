"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const formattedWaNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_FORMATTED || "+62 877-7765-2032";

  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

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
    <footer className="bg-white border-t border-gray-100 py-12 md:py-16 text-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-1 flex flex-col space-y-4">
            <div className="bg-brand-red p-3.5 rounded-xl inline-block shadow-sm self-start">
              <Image
                src="/logo.png"
                alt="Ayapi Krispi Bakar Logo"
                width={140}
                height={78}
                className="w-[120px] h-auto"
              />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Ayapi Krispi Bakar menyajikan ayam krispi bakar kualitas premium dengan bumbu meresap sampai ke dalam. Renyah di luar, juicy di dalam.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Navigasi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-brand-red transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-sm text-gray-500 hover:text-brand-red transition-colors duration-200">
                  Menu Kami
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-sm text-gray-500 hover:text-brand-red transition-colors duration-200">
                  Galeri Foto
                </Link>
              </li>
              <li>
                <Link href="/kemitraan" className="text-sm text-gray-500 hover:text-brand-red transition-colors duration-200">
                  Kemitraan Franchise
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-sm text-gray-500 hover:text-brand-red transition-colors duration-200">
                  Hubungi Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Jam Operasional</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Setiap Hari: 10:00 - 22:00 WIB</li>
              <li>Menerima Pesanan Partai Besar / Catering</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Kontak Kami</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-brand-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Jl. Mawar Indah No. 12, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{formattedWaNumber}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@ayapikrispibar.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p
            onClick={handleSecretClick}
            className="cursor-default select-none hover:text-gray-500 transition-colors"
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
