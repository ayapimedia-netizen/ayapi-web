"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLinks, getThemeSetting, incrementLinkClicks, getBranches, LinkItem, Branch } from "@/app/actions";

// Custom Inline SVG Icons to prevent lucide-react build errors
const IconWhatsApp = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.861-6.918C16.626 2.062 14.17 1.043 11.56 1.043c-5.443 0-9.865 4.386-9.867 9.782-.001 1.77.476 3.498 1.38 5.061L1.96 21.05l5.244-1.378zm11.385-6.85c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-1.205-.6-2.015-1.112-2.823-2.507-.213-.368-.213-.7-.076-.875.124-.15.275-.325.412-.49.137-.162.18-.275.273-.45.093-.188.046-.35-.022-.5-.069-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.369-.007-.565-.007-.196 0-.517.074-.788.374-.27.3-1.03 1.01-1.03 2.46s1.055 2.85 1.202 3.05c.148.2 2.077 3.17 5.034 4.45.703.303 1.25.485 1.678.62.707.224 1.35.193 1.86.117.567-.085 1.77-.724 2.02-1.41.25-.688.25-1.275.175-1.41-.075-.137-.275-.212-.575-.362z" />
  </svg>
);

const IconInstagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconGlobe = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconShoppingBag = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconFileText = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconBriefcase = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconLink2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconShare2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const IconClock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconCheck = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Theme mappings to custom Tailwind classes
const themeStyles: Record<string, {
  background: string;
  container: string;
  textTitle: string;
  textSubtitle: string;
  badgeOpen: string;
  badgeClosed: string;
  buttonNormal: string;
  buttonHover: string;
  buttonSubNormal: string;
  buttonSubHover: string;
  iconNormal: string;
  iconHover: string;
  accentHex: string;
  shadow: string;
}> = {
  peach: {
    background: "bg-gradient-to-b from-[#FFF5EE] via-[#FFEBE0] to-[#FFE4D6]",
    container: "bg-white/85 border-[#FFE4D6] backdrop-blur-md",
    textTitle: "text-[#5D4037]",
    textSubtitle: "text-[#8D6E63]",
    badgeOpen: "bg-orange-100/70 text-orange-850 border-orange-200/50",
    badgeClosed: "bg-red-50/70 text-red-700 border-red-100",
    buttonNormal: "bg-white/95 border-[#FFE4D6] text-[#5D4037] backdrop-blur-sm",
    buttonHover: "hover:bg-gradient-to-r hover:from-[#FF8C00] hover:to-[#FFA500] hover:text-white hover:border-[#FF8C00] hover:shadow-lg hover:shadow-orange-500/20",
    buttonSubNormal: "text-[#8D6E63]",
    buttonSubHover: "group-hover:text-orange-50/90",
    iconNormal: "bg-orange-50 text-[#FF8C00]",
    iconHover: "group-hover:bg-white/20 group-hover:text-white",
    accentHex: "#FF8C00",
    shadow: "shadow-xl shadow-orange-950/5"
  },
  crimson: {
    background: "bg-gradient-to-b from-[#FFF5F5] via-[#FFE8E8] to-[#FFE3E3]",
    container: "bg-white/85 border-[#FFE3E3] backdrop-blur-md",
    textTitle: "text-[#5C0606]",
    textSubtitle: "text-[#803030]",
    badgeOpen: "bg-red-50 text-red-800 border-red-100",
    badgeClosed: "bg-gray-100 text-gray-700 border-gray-200",
    buttonNormal: "bg-white/95 border-[#FFE3E3] text-[#5C0606] backdrop-blur-sm",
    buttonHover: "hover:bg-gradient-to-r hover:from-[#C62828] hover:to-[#E53935] hover:text-white hover:border-[#C62828] hover:shadow-lg hover:shadow-red-500/20",
    buttonSubNormal: "text-[#803030]",
    buttonSubHover: "group-hover:text-red-50/90",
    iconNormal: "bg-red-50 text-[#C62828]",
    iconHover: "group-hover:bg-white/20 group-hover:text-white",
    accentHex: "#C62828",
    shadow: "shadow-xl shadow-red-950/5"
  },
  forest: {
    background: "bg-gradient-to-b from-[#F4F9F4] via-[#EAF4EA] to-[#E1EFE1]",
    container: "bg-white/85 border-[#E1EFE1] backdrop-blur-md",
    textTitle: "text-[#1B4314]",
    textSubtitle: "text-[#3E6B37]",
    badgeOpen: "bg-emerald-50 text-emerald-800 border-emerald-100",
    badgeClosed: "bg-red-50 text-red-700 border-red-100",
    buttonNormal: "bg-white/95 border-[#E1EFE1] text-[#1B4314] backdrop-blur-sm",
    buttonHover: "hover:bg-gradient-to-r hover:from-[#2E7D32] hover:to-[#4CAF50] hover:text-white hover:border-[#2E7D32] hover:shadow-lg hover:shadow-green-500/20",
    buttonSubNormal: "text-[#3E6B37]",
    buttonSubHover: "group-hover:text-green-50/90",
    iconNormal: "bg-green-50 text-[#2E7D32]",
    iconHover: "group-hover:bg-white/20 group-hover:text-white",
    accentHex: "#2E7D32",
    shadow: "shadow-xl shadow-green-950/5"
  },
  midnight: {
    background: "bg-gradient-to-b from-[#0F172A] via-[#0B0F19] to-[#020617]",
    container: "bg-slate-900/85 border-slate-800/80 backdrop-blur-md",
    textTitle: "text-slate-100",
    textSubtitle: "text-slate-400",
    badgeOpen: "bg-indigo-950/70 text-indigo-300 border-indigo-900/50",
    badgeClosed: "bg-slate-800/70 text-slate-400 border-slate-700",
    buttonNormal: "bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-sm",
    buttonHover: "hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30",
    buttonSubNormal: "text-slate-400",
    buttonSubHover: "group-hover:text-indigo-200/90",
    iconNormal: "bg-indigo-950/70 text-indigo-400",
    iconHover: "group-hover:bg-white/20 group-hover:text-white",
    accentHex: "#6366F1",
    shadow: "shadow-xl shadow-black/40"
  },
  lilac: {
    background: "bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#EFE3FF]",
    container: "bg-white/85 border-[#EFE3FF] backdrop-blur-md",
    textTitle: "text-[#3B0764]",
    textSubtitle: "text-[#6B21A8]",
    badgeOpen: "bg-purple-50 text-purple-800 border-purple-100",
    badgeClosed: "bg-red-50 text-red-700 border-red-100",
    buttonNormal: "bg-white/95 border-[#EFE3FF] text-[#3B0764] backdrop-blur-sm",
    buttonHover: "hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#8B5CF6] hover:text-white hover:border-[#7C3AED] hover:shadow-lg hover:shadow-purple-500/20",
    buttonSubNormal: "text-[#6B21A8]",
    buttonSubHover: "group-hover:text-purple-50/90",
    iconNormal: "bg-purple-50 text-[#7C3AED]",
    iconHover: "group-hover:bg-white/20 group-hover:text-white",
    accentHex: "#7C3AED",
    shadow: "shadow-xl shadow-purple-950/5"
  }
};

// Map database strings to custom SVG components
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "WhatsApp":
      return IconWhatsApp;
    case "Instagram":
      return IconInstagram;
    case "Globe":
      return IconGlobe;
    case "ShoppingBag":
      return IconShoppingBag;
    case "FileText":
      return IconFileText;
    case "Briefcase":
      return IconBriefcase;
    default:
      return IconLink2;
  }
};

export default function WebAyapiLink() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [theme, setTheme] = useState<string>("peach");
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [witaTimeStr, setWitaTimeStr] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Load links and active theme settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const [linksData, themeData, branchesData] = await Promise.all([
          getLinks(),
          getThemeSetting(),
          getBranches()
        ]);
        setLinks(linksData);
        setTheme(themeData);
        setBranches(branchesData);
        if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0]);
        }
      } catch (err) {
        console.error("Gagal memuat data link-in-bio:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Operational Hours Check: WITA timezone (UTC+8)
  useEffect(() => {
    const calculateStatus = () => {
      if (!selectedBranch) return;
      const now = new Date();
      // Calculate UTC time by adding local offset
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      // WITA is UTC + 8 hours
      const witaTime = new Date(utcTime + (3600000 * 8));

      const currentHour = witaTime.getHours();
      const currentMinute = witaTime.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const openTimeStr = selectedBranch.open_time || "10:00";
      const closeTimeStr = selectedBranch.close_time || "22:00";

      const [openHour, openMin] = openTimeStr.split(":").map(Number);
      const [closeHour, closeMin] = closeTimeStr.split(":").map(Number);
      const openTimeInMinutes = openHour * 60 + openMin;
      const closeTimeInMinutes = closeHour * 60 + closeMin;

      let isOpen = false;
      if (closeTimeInMinutes < openTimeInMinutes) {
        // Overnights support (e.g. 17:00 to 02:00)
        isOpen = currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
      } else {
        isOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
      }
      
      setIsOpenNow(isOpen);

      const formatNum = (n: number) => n.toString().padStart(2, "0");
      setWitaTimeStr(`${formatNum(currentHour)}:${formatNum(currentMinute)} WITA`);
    };

    calculateStatus();
    const interval = setInterval(calculateStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [selectedBranch]);

  // Handle link clicking: analytics increment (non-blocking)
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, url: string) => {
    // Track click analytics in a non-blocking way
    if (id && !id.startsWith("fl-")) {
      incrementLinkClicks(id).catch((err) => console.warn("Analytics error:", err));
    }

    // Let the browser handle the navigation naturally via the <a> tag
    // Do NOT call e.preventDefault() — this avoids popup blocker issues
  };

  // Share button implementation
  const handleSharePage = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        })
        .catch((err) => console.error("Clipboard copy failed", err));
    }
  };

  const activeStyle = themeStyles[theme] || themeStyles.peach;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen -mt-24 sm:-mt-28 bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-red/10 border-t-brand-red animate-spin"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memuat Tautan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-[calc(100vh+96px)] sm:min-h-[calc(100vh+112px)] -mt-24 sm:-mt-28 ${activeStyle.background} transition-colors duration-500 py-16 px-4 relative flex flex-col justify-between overflow-hidden`}>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full blur-3xl opacity-10 bg-brand-red -z-10 animate-orb-1"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[350px] h-[350px] rounded-full blur-3xl opacity-10 bg-brand-yellow -z-10 animate-orb-2"></div>

      {/* Floating Share Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSharePage}
          className={`p-3 rounded-full bg-white/90 shadow-md border border-gray-100 hover:scale-110 transition-transform active:scale-95 duration-200 cursor-pointer text-gray-600 hover:text-brand-red`}
          title="Bagikan Halaman"
        >
          <IconShare2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto flex flex-col items-center mt-8">
        
        {/* Profile Card */}
        <div className={`w-full ${activeStyle.container} border p-6 rounded-3xl ${activeStyle.shadow} flex flex-col items-center text-center space-y-4 mb-8 relative animate-fade-in-up`}>
          {/* Logo container */}
          <div className="bg-brand-red p-4 rounded-2xl inline-block shadow-md transition-transform duration-300 hover:scale-105">
            <Image
              src="/logo.png"
              alt="Ayapi Logo"
              width={100}
              height={56}
              priority
              loading="eager"
              className="w-[90px] h-auto"
            />
          </div>

          <div className="space-y-1">
            <h1 className={`text-xl font-black ${activeStyle.textTitle} tracking-tight`}>
              Ayapi Krispi Bakar
            </h1>
            <p className={`text-xs font-semibold uppercase tracking-wider ${activeStyle.textSubtitle}`}>
              Bali, Indonesia
            </p>
          </div>

          <p className={`text-xs font-medium leading-relaxed ${activeStyle.textSubtitle} max-w-sm`}>
            Ayam krispi renyah dengan aroma smoky bakar khas bumbu karamel Nusantara. Juara rasa, nikmat tak terkira!
          </p>

          {/* Branch Selector Dropdown */}
          {branches.length > 0 && (
            <div className="w-full max-w-xs mt-2 relative z-20">
              <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 ${activeStyle.textSubtitle}`}>
                📍 Pilih Lokasi Outlet:
              </label>
              <select
                value={selectedBranch?.id || ""}
                onChange={(e) => {
                  const br = branches.find((b) => b.id === e.target.value);
                  if (br) setSelectedBranch(br);
                }}
                className={`w-full px-3 py-2 text-xs font-bold rounded-xl border ${
                  theme === "midnight" 
                    ? "bg-slate-800 border-slate-700 text-slate-100" 
                    : "bg-white border-gray-200 text-gray-700"
                } focus:outline-none focus:ring-1 focus:ring-brand-red transition-all cursor-pointer`}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* WITA Operational Status Badge */}
          {selectedBranch && (
            <div className="flex flex-col items-center gap-1.5 pt-1.5">
              <div className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2.5 ${isOpenNow ? activeStyle.badgeOpen : activeStyle.badgeClosed}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpenNow ? "bg-emerald-400" : "bg-red-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpenNow ? "bg-emerald-500" : "bg-red-500"}`}></span>
                </span>
                <span>{isOpenNow ? "Buka Sekarang" : "Tutup"}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                <IconClock className="w-3 h-3" />
                <span>Jam Operasional: {selectedBranch.open_time || "10:00"} - {selectedBranch.close_time || "22:00"} WITA</span>
              </div>
              <div className="text-[9px] text-gray-400 font-bold uppercase">
                Waktu WITA Saat Ini: {witaTimeStr}
              </div>
            </div>
          )}
        </div>

        {/* Links Stack */}
        <div className="w-full space-y-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          {links.map((link) => {
            const Icon = getIconComponent(link.icon);
            return (
              <a
                key={link.id}
                href={link.url}
                onClick={(e) => handleLinkClick(e, link.id || "", link.url)}
                className={`w-full border group ${activeStyle.buttonNormal} ${activeStyle.buttonHover} p-4.5 rounded-2xl flex items-center justify-between shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer`}
              >
                <div className="flex items-center gap-4 text-left">
                  <span className={`p-2.5 rounded-xl shrink-0 transition-all duration-300 ${activeStyle.iconNormal} ${activeStyle.iconHover} group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider leading-tight">
                      {link.title}
                    </h2>
                    {link.subtitle && (
                      <p className={`text-[10px] font-medium leading-tight mt-0.5 transition-colors duration-300 ${activeStyle.buttonSubNormal} ${activeStyle.buttonSubHover}`}>
                        {link.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <span className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            );
          })}
        </div>

      </div>

      {/* Footer / Back Link */}
      <div className="w-full text-center space-y-3 pt-12 z-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <Link 
          href="/" 
          className={`text-xs font-black uppercase tracking-widest ${activeStyle.textTitle} hover:text-brand-red transition-colors inline-block pb-1 border-b-2 border-transparent hover:border-brand-red`}
        >
          ← Kembali Ke Website Utama
        </Link>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} Ayapi Krispi Bakar Indonesia. All Rights Reserved.
        </p>
      </div>

      {/* Floating Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-800">
          <IconCheck className="w-4 h-4 text-emerald-400" />
          <span>Tautan berhasil disalin ke papan klip!</span>
        </div>
      </div>

    </div>
  );
}
