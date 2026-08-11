"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar on links and admin pages
  if (
    pathname === "/links" ||
    pathname === "/link" ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Gallery", href: "/gallery" },
    { name: "Kemitraan", href: "/kemitraan" },
    { name: "Kontak", href: "/kontak" },
    { name: "Links", href: "/links" },
  ];

  return (
    <div className="fixed top-4 left-0 right-0 z-50 w-full flex justify-center px-4 pointer-events-none">
      <nav
        className={`w-full bg-brand-red/95 backdrop-blur-xl text-white border border-white/20 shadow-2xl rounded-2xl pointer-events-auto transition-all duration-500 ease-out hover:border-brand-orange/60 ${isScrolled ? "max-w-5xl py-1 shadow-xl border-brand-orange/50" : "max-w-7xl py-2"
          }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/logo.png"
                  alt="Ayapi Krispi Bakar Logo"
                  width={140}
                  height={80}
                  priority
                  loading="eager"
                  className="w-[100px] sm:w-[125px] h-auto transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/10 border border-white/15 p-1.5 rounded-full backdrop-blur-md">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-extrabold tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 ${isActive
                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/40"
                        : "text-brand-cream/90 hover:text-white hover:bg-white/15"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link
                href="/menu"
                className="relative overflow-hidden bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg transition-all duration-300 inline-block text-xs hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Flame className="w-4 h-4 fill-white animate-pulse" />
                  Pesan Menu
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:text-brand-yellow focus:outline-none hover:bg-white/10 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-screen opacity-100 border-t border-white/10 mt-2" : "max-h-0 opacity-0 overflow-hidden"
            }`}
          id="mobile-menu"
        >
          <div className="px-3 pt-3 pb-4 space-y-1.5 bg-[#99000B]/98 backdrop-blur-xl rounded-b-2xl border-t border-white/20">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${isActive
                      ? "bg-brand-red text-white"
                      : "text-gray-200 hover:bg-white/10 hover:text-brand-yellow"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-4 px-1">
              <Link
                href="/kontak"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-gradient-to-r from-brand-yellow to-amber-400 text-black font-black uppercase tracking-widest px-4 py-3 rounded-xl shadow-md transition-all duration-300 text-xs"
              >
                🔥 Pesan Sekarang
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

