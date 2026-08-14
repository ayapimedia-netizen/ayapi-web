"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  addPartnershipLead,
  getPartnershipPackages,
  getFaqs,
  getAllSiteSettings,
  PartnershipPackage,
  FAQItem,
} from "@/app/actions";


type PackageDetail = {
  id: string;
  package_key?: string;
  name: string;
  priceText: string;
  priceValue: number;
  originalPrice?: string;
  dimensions?: string;
  group: "express" | "resto";
  description: string;
  badge?: string;
  image: string;
  inclusions: string[];
};

const packages: PackageDetail[] = [
  {
    id: "express-1",
    package_key: "express-1",
    name: "Paket Express 1",
    priceText: "15 Juta*",
    priceValue: 15000000,
    originalPrice: "20 JUTA",
    dimensions: "100 x 60 x 160 cm",
    group: "express",
    description: "Lebih Ringkas, Tetap Menarik! Dimensi Rombong: 100 x 60 x 160 cm. Konsep praktis, hemat tempat, cocok untuk pemula dan lokasi padat lalu lintas.",
    badge: "Budget Friendly",
    image: "/express_booth_mockup.png",
    inclusions: [
      "Rombong Express Ringkas (100 x 60 x 160 cm)",
      "Peralatan Masak & Penggorengan Lengkap",
      "Starter Kit Bahan Baku Awal (Ayam & Bumbu)",
      "Media Promosi Fisik (Banner & Menu)",
      "SOP Penyajian & Pelatihan Karyawan",
      "Terdaftar di Platform Pesan Antar Online",
    ],
  },
  {
    id: "express-2",
    package_key: "express-2",
    name: "Paket Express 2",
    priceText: "28 Juta*",
    priceValue: 28000000,
    originalPrice: "35 JUTA",
    dimensions: "125 x 60 x 200 cm",
    group: "express",
    description: "Rombong Lebih Luas, Tampilan Lebih Maksimal! Dimensi Rombong: 125 x 60 x 200 cm. Kapasitas display etalase lebih luas untuk omzet harian lebih tinggi.",
    badge: "Best Value!",
    image: "/express_booth_mockup.png",
    inclusions: [
      "Rombong Express Luas (125 x 60 x 200 cm)",
      "Peralatan Lengkap & Display Etalase Luas",
      "Starter Kit Bahan Baku Skala Menengah",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Support Promosi & Integrasi Ojol Delivery",
    ],
  },
  {
    id: "resto-1",
    package_key: "resto-1",
    name: "Paket Resto 1",
    priceText: "90 Juta*",
    priceValue: 90000000,
    originalPrice: "100 JUTA",
    dimensions: "4 x 6 METER",
    group: "resto",
    description: "Resto minimalis & fungsional. Ukuran: 4 x 6 METER. Solusi ideal menghadirkan pengalaman dine-in hemat namun tetap nyaman dan estetik.",
    badge: "Resto Minimalis",
    image: "/mini_resto_mockup.png",
    inclusions: [
      "Layout Outlet Minimalis & Fungsional (4 x 6 M)",
      "Set Peralatan Resto & Dapur Komersial Standar",
      "Set Meja & Kursi Dine-in Pelanggan",
      "Starter Kit Bahan Baku & Bumbu Rempah",
      "Sistem Kasir Cloud POS & Training Manajemen",
      "Media Promosi & Panduan Branding Resto",
    ],
  },
  {
    id: "resto-2",
    package_key: "resto-2",
    name: "Paket Resto 2",
    priceText: "135 Juta*",
    priceValue: 135000000,
    originalPrice: "150 JUTA",
    dimensions: "5 x 7 METER",
    group: "resto",
    description: "Resto modern & lebih luas. Ukuran: 5 x 7 METER. Menampung lebih banyak pelanggan dengan atmosfer modern dan operasional yang efisien.",
    badge: "Resto Modern",
    image: "/mini_resto_mockup.png",
    inclusions: [
      "Layout Outlet Modern & Luas (5 x 7 M)",
      "Peralatan Dapur Komersial Stainless Steel",
      "Kapasitas Dine-in Nyaman & Estetik",
      "Starter Kit Bahan Baku Skala Besar",
      "Sistem POS Kasir, Tablet, & SOP Lengkap",
      "Support Grand Opening & Marketing Sosmed",
    ],
  },
  {
    id: "resto-3",
    package_key: "resto-3",
    name: "Paket Resto 3",
    priceText: "180 Juta*",
    priceValue: 180000000,
    originalPrice: "200 JUTA",
    dimensions: "6 x 8 METER",
    group: "resto",
    description: "Resto premium & full experience. Ukuran: 6 x 8 METER. Konsep flagship resto dengan kapasitas maksimal, interior mewah, dan pengalaman kuliner terlengkap.",
    badge: "Full Experience",
    image: "/premium_resto_mockup.png",
    inclusions: [
      "Desain Interior & Renovasi Full Experience (6 x 8 M)",
      "Peralatan Dapur Premium Kapasitas Maksimal",
      "Kapasitas Dine-in Luas & Nyaman (30+ Kursi)",
      "Paket Bahan Baku Terlengkap",
      "Pendampingan Grand Opening Tim Pusat",
      "Kampanye Marketing & Influencer Launching",
    ],
  },
];

type Benefit = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Step = {
  step: string;
  title: string;
  desc: string;
};


export default function Kemitraan() {
  const [selectedPackage, setSelectedPackage] = useState<string>("express-1");
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<"all" | "express" | "resto">("all");

  // Dynamic DB States
  const [pkgList, setPkgList] = useState<PartnershipPackage[]>([]);
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const [pkgs, faqsData, settingsData] = await Promise.all([
          getPartnershipPackages(),
          getFaqs(),
          getAllSiteSettings(),
        ]);
        if (pkgs && pkgs.length > 0) setPkgList(pkgs);
        if (faqsData && faqsData.length > 0) setFaqList(faqsData);
        if (settingsData) setSiteSettings(settingsData);
      } catch (err) {
        console.error("Gagal memuat data kemitraan:", err);
      }
    };
    loadDynamicData();
  }, []);

  // Calculator States
  const [dailySales, setDailySales] = useState(100);
  const [avgPrice, setAvgPrice] = useState(25000);


  // Custom Operational Cost States
  const [isCustomOps, setIsCustomOps] = useState(false);
  const [customRent, setCustomRent] = useState(1500000);
  const [customSalaries, setCustomSalaries] = useState(3000000);
  const [customUtilities, setCustomUtilities] = useState(1500000);

  // FAQ Active State
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  // Proposal Download Modal States
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadName, setDownloadName] = useState("");
  const [downloadPhone, setDownloadPhone] = useState("");
  const [isDownloadSubmitted, setIsDownloadSubmitted] = useState(false);

  const handleSelectPackage = (pkgKey: string) => {
    setSelectedPackage(pkgKey);
    if (pkgKey.includes("express")) {
      setDailySales(100);
      setCustomRent(1500000);
      setCustomSalaries(3000000);
      setCustomUtilities(1500000);
    } else if (pkgKey.includes("resto-1")) {
      setDailySales(160);
      setCustomRent(4000000);
      setCustomSalaries(6000000);
      setCustomUtilities(2500000);
    } else if (pkgKey.includes("resto-2")) {
      setDailySales(220);
      setCustomRent(7000000);
      setCustomSalaries(9000000);
      setCustomUtilities(4000000);
    } else {
      setDailySales(300);
      setCustomRent(12000000);
      setCustomSalaries(14000000);
      setCustomUtilities(6000000);
    }
    
    const calcSection = document.getElementById("roi-calculator");
    if (calcSection) {
      calcSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+62|62|0)8[0-9]{7,12}$/;
    return phoneRegex.test(cleanPhone);
  };

  const openDownloadModal = () => {
    setIsDownloadSubmitted(false);
    setDownloadName("");
    setDownloadPhone("");
    setIsDownloadModalOpen(true);
  };

  const triggerPdfDownload = () => {
    const link = document.createElement("a");
    link.href = "/proposal-kemitraan-ayapi.pdf";
    link.download = "Proposal-Kemitraan-Ayapi.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerWhatsAppChat = () => {
    const waNumber = siteSettings.wa_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628213444730";
    const messageTemplate =
      `Halo Tim Kemitraan Ayapi!\n` +
      `Saya baru saja mendaftar untuk mengunduh proposal kemitraan via website.\n\n` +
      `*Nama:* ${downloadName}\n` +
      `*No. HP/WA:* ${downloadPhone}\n\n` +
      `Mohon info lebih lanjut ya. Terima kasih!`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageTemplate)}`;
    window.open(waUrl, "_blank");
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadName.trim() || !downloadPhone.trim()) {
      alert("Silakan isi nama dan nomor WhatsApp Anda.");
      return;
    }

    if (!validatePhone(downloadPhone)) {
      alert("Format nomor WhatsApp tidak valid. Silakan masukkan nomor HP/WhatsApp Indonesia yang benar (contoh: 0812XXXXXXXX).");
      return;
    }

    try {
      await addPartnershipLead({
        name: downloadName.trim(),
        phone: downloadPhone.trim(),
      });
    } catch (dbErr) {
      console.error("Gagal menyimpan prospek ke database:", dbErr);
    }

    setIsDownloadSubmitted(true);
  };

  // Financial Constants
  const activePackagesList = pkgList.length > 0 ? pkgList : packages;

  const activeSelectedPkgObj = activePackagesList.find((p: any) => (p.package_key || p.id) === selectedPackage) || activePackagesList[0];

  const initialInvestment = activeSelectedPkgObj ? ((activeSelectedPkgObj as any).price_value || (activeSelectedPkgObj as any).priceValue || 50000000) : 50000000;


  const fixedOpsCost = isCustomOps
    ? customRent + customSalaries + customUtilities
    : selectedPackage === "express" ? 6000000 :
      selectedPackage === "mini" ? 15000000 : 25000000;

  const rawCogsVal = siteSettings.roi_cogs_percent ? parseFloat(siteSettings.roi_cogs_percent) : 55;
  const cogsPercent = rawCogsVal / 100;

  // Financial Calculations
  const monthlyRevenue = dailySales * avgPrice * 30;
  const cogsCost = monthlyRevenue * cogsPercent;
  const grossProfit = monthlyRevenue - cogsCost;
  const netProfit = Math.max(0, grossProfit - fixedOpsCost);

  const roiMonths = netProfit > 0 ? (initialInvestment / netProfit).toFixed(1) : "N/A";

  const cogsPercentage = Math.round(rawCogsVal);
  const opsPercentage = Math.min(100 - cogsPercentage, Math.round((fixedOpsCost / monthlyRevenue) * 100));
  const netProfitPercentage = Math.max(0, 100 - cogsPercentage - opsPercentage);


  const benefits: Benefit[] = [
    {
      title: "Brand Kuat",
      description: "Bagian dari Ayapi Krispi Bakar dengan reputasi cita rasa aroma smoky juara yang telah disukai berbagai kalangan di Indonesia.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "Training & Pendampingan",
      description: "Pelatihan komprehensif sebelum dan sesudah grand opening untuk memastikan standar kualitas dan SOP operasional berjalan optimal.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Marketing Support",
      description: "Dukungan materi promosi berkala, aset visual media sosial, dan bimbingan strategi pemasaran digital untuk meningkatkan penjualan.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      title: "Supply Chain Terjamin",
      description: "Distribusi bahan baku dan bumbu marinasi khas terjamin ketersediaannya dengan standar kualitas rasa yang konsisten.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: "After Sales Support",
      description: "Tim kemitraan pusat siap mendampingi mitra dalam evaluasi kinerja, konsultasi operasional, dan pengembangan omzet outlet.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "0% Royalty Fee",
      description: "Tidak ada potongan bagi hasil bulanan. Seluruh keuntungan bersih dari penjualan outlet 100% menjadi milik mitra.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const steps: Step[] = [
    {
      step: "01",
      title: "Hubungi Kontak",
      desc: "Konsultasikan lokasi dan ketertarikan Anda melalui tim marketing kami.",
    },
    {
      step: "02",
      title: "Survei & Analisis",
      desc: "Tim kami akan menganalisis lokasi outlet potensial Anda secara komprehensif.",
    },
    {
      step: "03",
      title: "Tanda Tangan & Bayar",
      desc: "Melakukan penandatanganan kemitraan resmi dan administrasi investasi.",
    },
    {
      step: "04",
      title: "Pelatihan & Buka",
      desc: "Pengiriman booth/perlengkapan, training SOP staf, dan grand opening outlet.",
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: "Apakah bumbu rahasia disediakan oleh pusat?",
      answer: "Ya, semua bumbu rahasia marinasi ayam dan saus bakar disuplai dari pusat dalam bentuk kemasan praktis untuk menjaga konsistensi cita rasa khas Ayapi di semua cabang.",
    },
    {
      question: "Berapa lama estimasi waktu dari tanda tangan kontrak hingga outlet buka?",
      answer: "Proses lengkap rata-rata memakan waktu 2 hingga 4 minggu, meliputi survei lokasi, pengiriman booth, pelatihan SOP karyawan, hingga persiapan Grand Opening.",
    },
    {
      question: "Apakah ada royalti fee bulanan?",
      answer: "Tidak. Ayapi menggunakan sistem kemitraan tanpa bagi hasil bulanan (0% royalty fee). Semua keuntungan bersih yang diperoleh dari outlet sepenuhnya milik mitra.",
    },
    {
      question: "Bagaimana dengan pencarian lokasi dan karyawan?",
      answer: "Pencarian lokasi dan karyawan dilakukan oleh mitra. Namun, tim analis kami akan melakukan survei kelayakan lokasi secara mendalam dan menyediakan materi pelatihan lengkap untuk karyawan Anda.",
    },
    {
      question: "Apakah boleh menjual menu di luar menu resmi Ayapi?",
      answer: "Demi menjaga standardisasi brand dan kualitas rasa, mitra dilarang keras menjual menu makanan berat di luar menu resmi yang dikeluarkan oleh pusat Ayapi.",
    },
  ];

  const formatCurrency = (value: number) => {
    return "Rp " + value.toLocaleString("id-ID");
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQIndex(activeFAQIndex === index ? null : index);
  };

  const getPackageGroup = (pkg: any): "express" | "resto" => {
    const key = (pkg.package_key || pkg.id || "").toLowerCase();
    const name = (pkg.name || "").toLowerCase();
    if (key.includes("express") || name.includes("express")) return "express";
    return "resto";
  };

  const getPackageDimensions = (pkg: any): string => {
    const key = (pkg.package_key || pkg.id || "").toLowerCase();
    const name = (pkg.name || "").toLowerCase();
    if (key.includes("express-1") || name.includes("express 1")) return "Dimensi Rombong: 100 x 60 x 160 cm";
    if (key.includes("express-2") || name.includes("express 2")) return "Dimensi Rombong: 125 x 60 x 200 cm";
    if (key.includes("resto-1") || name.includes("resto 1")) return "Ukuran: 4 x 6 METER";
    if (key.includes("resto-2") || name.includes("resto 2")) return "Ukuran: 5 x 7 METER";
    if (key.includes("resto-3") || name.includes("resto 3")) return "Ukuran: 6 x 8 METER";
    return "";
  };

  const getPackageOriginalPrice = (pkg: any): string => {
    const key = (pkg.package_key || pkg.id || "").toLowerCase();
    const name = (pkg.name || "").toLowerCase();
    if (key.includes("express-1") || name.includes("express 1")) return "20 JUTA";
    if (key.includes("express-2") || name.includes("express 2")) return "35 JUTA";
    if (key.includes("resto-1") || name.includes("resto 1")) return "100 JUTA";
    if (key.includes("resto-2") || name.includes("resto 2")) return "150 JUTA";
    if (key.includes("resto-3") || name.includes("resto 3")) return "200 JUTA";
    return "";
  };

  const filteredPackages = activePackagesList.filter((pkg: any) => {
    if (packageCategoryFilter === "all") return true;
    return getPackageGroup(pkg) === packageCategoryFilter;
  });

  return (
    <div className="w-full bg-white bg-grid-pattern-light">
      {/* Intro Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50 border-b border-gray-100 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
            Peluang Investasi Kemitraan
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-brand-dark mb-4 tracking-tight">
            Paket Kemitraan Ayapi Express & Ayapi Krispi Bakar
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Mitra Anda, Sukses Bersama Ayapi! Dapatkan peluang bisnis kuliner ayam krispi bakar menguntungkan dengan sistem teruji, pasokan bahan baku berkualitas, dan dukungan penuh manajemen.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
              Keunggulan Kemitraan
            </span>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Mengapa Memilih AYAPI?</h2>
            <p className="text-gray-500 text-sm md:text-base">5 Pilar utama yang membuat bisnis kemitraan Ayapi cepat berkembang dan menguntungkan.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-7 rounded-3xl border border-gray-200/60 shadow-premium hover:shadow-premium-hover hover-scale-premium transition-all duration-300 flex flex-col space-y-3"
              >
                <div className="p-3 bg-brand-red/5 rounded-2xl self-start">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-extrabold text-brand-dark">{benefit.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Paket Kemitraan */}
      <section className="py-16 md:py-24 bg-gray-50/50 border-t border-gray-100 bg-grid-pattern-light" id="paket-investasi">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
              Tipe & Pilihan Outlet
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">
              Pilihan Paket Investasi Kemitraan
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Sesuaikan model kemitraan Anda. Mulai dari Rombong Express praktis dan hemat hingga Restoran modern dengan pengalaman kuliner terlengkap.
            </p>

            {/* Filter Category Tabs */}
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setPackageCategoryFilter("all")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  packageCategoryFilter === "all"
                    ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red"
                }`}
              >
                Semua Paket ({activePackagesList.length})
              </button>
              <button
                onClick={() => setPackageCategoryFilter("express")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  packageCategoryFilter === "express"
                    ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red"
                }`}
              >
                🛒 Paket Express ({activePackagesList.filter((p: any) => getPackageGroup(p) === "express").length})
              </button>
              <button
                onClick={() => setPackageCategoryFilter("resto")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  packageCategoryFilter === "resto"
                    ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red"
                }`}
              >
                🏪 Paket Resto ({activePackagesList.filter((p: any) => getPackageGroup(p) === "resto").length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {filteredPackages.map((pkg: any) => {
              const pKey = pkg.package_key || pkg.id;
              const isSelected = selectedPackage === pKey;
              const priceText = pkg.price_text || pkg.priceText || "";
              const originalPrice = pkg.originalPrice || getPackageOriginalPrice(pkg);
              const dimensions = pkg.dimensions || getPackageDimensions(pkg);
              const group = getPackageGroup(pkg);

              return (
                <div
                  key={pkg.id || pKey}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col relative overflow-hidden group shadow-premium hover:shadow-premium-hover ${
                    pkg.badge ? "border-brand-red/40 ring-1 ring-brand-red/35" : "border-gray-200/80"
                  } ${isSelected ? "ring-2 ring-brand-red border-transparent shadow-xl" : ""}`}
                >
                  {/* Category Pill Top Left */}
                  <div className="absolute top-4 left-4 bg-brand-dark/80 backdrop-blur-md text-white text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full z-10 shadow-sm border border-white/10">
                    {group === "express" ? "PAKET EXPRESS" : "PAKET RESTO"}
                  </div>

                  {/* Badge Top Right */}
                  {pkg.badge && (
                    <div className="absolute top-4 right-4 bg-brand-red text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full z-10 shadow-sm animate-pulse">
                      {pkg.badge}
                    </div>
                  )}

                  {/* Mockup Image */}
                  <div className="relative h-60 w-full overflow-hidden bg-gray-50 border-b border-gray-100">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, 33vw"
                      priority={pKey === "express-1" || pKey === "express"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-2xl font-black text-brand-dark tracking-tight uppercase">
                        {pkg.name}
                      </h3>

                      {/* Pricing Block with Strikethrough */}
                      <div className="mt-2">
                        {originalPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 line-through font-bold">{originalPrice}</span>
                            <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase">PROMO SPESIAL</span>
                          </div>
                        )}
                        <div className="flex items-baseline text-brand-red mt-0.5">
                          <span className="text-3xl font-black tracking-tight">{priceText.replace("*", "")}</span>
                          <span className="text-xs font-semibold text-gray-400 ml-1.5">* Investasi</span>
                        </div>
                      </div>

                      {/* Dimension / Ukuran Badge */}
                      {dimensions && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] font-extrabold text-amber-900">
                          <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>{dimensions}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                      {pkg.description}
                    </p>

                    <div className="h-px bg-gray-100 mb-6"></div>

                    <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-3">
                      Inklusi Paket:
                    </h4>

                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {(pkg.inclusions || []).map((inc: string, i: number) => (
                        <li key={i} className="flex items-start text-xs text-gray-600 gap-2.5">
                          <span className="p-0.5 bg-green-50 rounded-full shrink-0 text-green-600 mt-0.5 border border-green-200">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="leading-snug">{inc}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPackage(pKey)}
                      className={`w-full py-4 rounded-xl text-xs uppercase font-black tracking-widest transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${
                        isSelected
                          ? "bg-brand-dark hover:bg-black text-white"
                          : "bg-brand-red hover:bg-[#a01c1c] text-white"
                      }`}
                    >
                      {isSelected ? "✓ Paket Dipilih (Hitung ROI)" : `Saya Mau ${pkg.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perbandingan Franchise Section */}

      <section className="py-16 md:py-24 bg-white border-t border-gray-100 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
              Perbandingan Bisnis
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">
              Kenapa Memilih AYAPI?
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Analisis komparatif antara bergabung dengan jaringan franchise AYAPI dibandingkan dengan franchise kuliner ayam goreng konvensional lainnya.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-gray-200/80 shadow-premium bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-dark text-white text-xs sm:text-sm font-bold">
                    <th className="p-4 sm:p-5 w-1/3">Fitur / Keunggulan</th>
                    <th className="p-4 sm:p-5 bg-brand-red text-center w-1/3 text-brand-yellow">AYAPI Krispi Bakar</th>
                    <th className="p-4 sm:p-5 text-center text-gray-300 w-1/3">Franchise Ayam Lain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Royalty Fee Bulanan</td>
                    <td className="p-4 sm:p-5 text-center font-black text-green-700 bg-green-50/20">
                      0% (100% Laba Milik Anda)
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500">
                      3% - 5% dari Omzet Kotor
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Inovasi & Keunikan Menu</td>
                    <td className="p-4 sm:p-5 text-center font-black text-brand-red bg-brand-red/5">
                      Ayam Krispi Bakar (Pelopor Sambal Bakar Nusantara)
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500">
                      Hanya Ayam Goreng Tepung Biasa (Mudah Ditiru)
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Margin Keuntungan Kotor</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-brand-dark bg-brand-red/5">
                      Tinggi (Hingga 45%)
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500">
                      Rendah (Rata-rata 30% - 35%)
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Dukungan Marketing Pusat</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-brand-dark bg-brand-red/5">
                      Promosi Digital Aktif & Campaign Influencer Hype
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500">
                      Hanya Diberikan Spanduk Fisik Tanpa Iklan Digital
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Masa Berlaku Kontrak</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-brand-dark bg-brand-red/5">
                      Seumur Hidup (Tanpa Biaya Perpanjangan)
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500">
                      Terbatas 3-5 Tahun (Wajib Bayar Biaya Perpanjangan)
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Estimasi Balik Modal (ROI)</td>
                    <td className="p-4 sm:p-5 text-center font-black text-green-700 bg-green-50/20">
                      Cepat (Rata-rata &lt; 6 Bulan)
                    </td>
                    <td className="p-4 sm:p-5 text-center text-gray-500">
                      Lambat (12 - 18 Bulan)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FINANCIAL ROI SIMULATOR SECTION */}
      <section id="roi-calculator" className="py-16 md:py-24 bg-white border-t border-b border-gray-100 bg-grid-pattern-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Simulasi Keuntungan</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">Kalkulator Kemitraan (ROI)</h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base">
              Sesuaikan target penjualan harian Anda dan lihat estimasi laba bersih bulanan serta seberapa cepat investasi modal awal Anda kembali.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
            {/* Left: Input Sliders */}
            <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-gray-200/60 shadow-premium space-y-8">
              {/* Package Selector Tabs */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Pilih Paket Franchise:
                </label>
                <div className="grid grid-cols-3 gap-2 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/40">
                  {(["express", "mini", "premium"] as const).map((pkg) => (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => handleSelectPackage(pkg)}
                      className={`py-3 px-2 rounded-xl text-center font-extrabold text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        selectedPackage === pkg
                          ? "bg-brand-red text-white shadow-sm"
                          : "text-gray-500 hover:text-brand-dark hover:bg-gray-200/50"
                      }`}
                    >
                      {pkg === "express" ? "Express" : pkg === "mini" ? "Mini Resto" : "Premium"}
                    </button>
                  ))}
                </div>
              </div>

              <h3 className="font-bold text-lg text-brand-dark border-b border-gray-100 pb-3 flex items-center gap-2 pt-2">
                <svg className="w-5 h-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Atur Asumsi Penjualan
              </h3>

              {/* Slider 1: Sales / Day */}
              <div className="space-y-3">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-gray-500">Porsi Terjual / Hari</span>
                  <span className="text-brand-red text-base">{dailySales} Porsi</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={dailySales}
                  onChange={(e) => setDailySales(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                />
                <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                  <span>50 Porsi</span>
                  <span>150 Porsi</span>
                  <span>300 Porsi</span>
                </div>
              </div>

              {/* Slider 2: Average Price */}
              <div className="space-y-3">
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-gray-500">Harga Rata-rata / Porsi</span>
                  <span className="text-brand-red text-base">{formatCurrency(avgPrice)}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="35000"
                  step="1000"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                />
                <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                  <span>Rp 20.000</span>
                  <span>Rp 27.000</span>
                  <span>Rp 35.000</span>
                </div>
              </div>

              {/* Custom Operations Costs Toggle & Inputs */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-brand-dark">Kustomisasi Biaya Operasional</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomOps(!isCustomOps)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isCustomOps ? "bg-brand-red" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isCustomOps ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Aktifkan untuk menyesuaikan sewa tempat, gaji karyawan, dan tagihan utilitas di daerah Anda.
                </p>
              </div>

              {isCustomOps && (
                <div className="space-y-6 pt-2 border-t border-gray-100/50 animate-fade-in">
                  {/* Rent Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-gray-500">Biaya Sewa Tempat / Bulan</span>
                      <span className="text-brand-red">{formatCurrency(customRent)}</span>
                    </div>
                    <input
                      type="range"
                      min={selectedPackage === "express" ? 500000 : 2000000}
                      max={selectedPackage === "premium" ? 25000000 : 15000000}
                      step={selectedPackage === "express" ? 100000 : 500000}
                      value={customRent}
                      onChange={(e) => setCustomRent(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                    />
                    <div className="flex justify-between text-[8px] font-semibold text-gray-400">
                      <span>{formatCurrency(selectedPackage === "express" ? 500000 : 2000000)}</span>
                      <span>{formatCurrency(selectedPackage === "premium" ? 25000000 : 15000000)}</span>
                    </div>
                  </div>

                  {/* Salaries Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-gray-500">Gaji Karyawan / Bulan</span>
                      <span className="text-brand-red">{formatCurrency(customSalaries)}</span>
                    </div>
                    <input
                      type="range"
                      min={selectedPackage === "express" ? 1000000 : 3000000}
                      max={selectedPackage === "premium" ? 25000000 : 15000000}
                      step={500000}
                      value={customSalaries}
                      onChange={(e) => setCustomSalaries(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                    />
                    <div className="flex justify-between text-[8px] font-semibold text-gray-400">
                      <span>{formatCurrency(selectedPackage === "express" ? 1000000 : 3000000)}</span>
                      <span>{formatCurrency(selectedPackage === "premium" ? 25000000 : 15000000)}</span>
                    </div>
                  </div>

                  {/* Utilities Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-gray-500">Tagihan Utilitas & Operasional / Bulan</span>
                      <span className="text-brand-red">{formatCurrency(customUtilities)}</span>
                    </div>
                    <input
                      type="range"
                      min={500000}
                      max={10000000}
                      step={250000}
                      value={customUtilities}
                      onChange={(e) => setCustomUtilities(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                    />
                    <div className="flex justify-between text-[8px] font-semibold text-gray-400">
                      <span>Rp 500.000</span>
                      <span>Rp 10.000.000</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Parameter Tetap Bisnis:</h4>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Investasi Paket Awal</span>
                  <span className="font-semibold">{formatCurrency(initialInvestment)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Estimasi Biaya Operasional/Bulan</span>
                  <span className="font-semibold">{formatCurrency(fixedOpsCost)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Margin Keuntungan Kotor</span>
                  <span className="font-semibold text-green-600">45% dari Penjualan</span>
                </div>
              </div>
            </div>

            {/* Right: Results Dashboard */}
            <div className="lg:col-span-7 bg-white text-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-200/90 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/5 rounded-full blur-3xl -z-10"></div>

              <h3 className="font-black text-lg border-b border-gray-100 pb-3 flex items-center gap-2 text-gray-900">
                <svg className="w-5 h-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                Proyeksi Keuangan Bulanan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-1.5">
                  <span className="text-xs text-gray-600 font-bold">Pendapatan Kotor Bulanan</span>
                  <p className="text-xl md:text-2xl font-black text-gray-900">{formatCurrency(monthlyRevenue)}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl space-y-1.5">
                  <span className="text-xs text-gray-600 font-bold">Estimasi HPP Bahan Baku (55%)</span>
                  <p className="text-xl md:text-2xl font-black text-brand-red">{formatCurrency(cogsCost)}</p>
                </div>

                <div className="bg-brand-red/5 border border-brand-red/20 p-5 rounded-2xl space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-brand-red font-black uppercase tracking-wider">Estimasi Laba Bersih Bulanan (Milik Anda)</span>
                  <p className="text-3xl md:text-4xl font-black text-brand-red">{formatCurrency(netProfit)}</p>
                  <p className="text-[10px] text-gray-600 font-medium leading-normal pt-1">
                    *Laba Bersih sudah dikurangi biaya operasional bulanan (biaya sewa, gaji staf, utilitas listrik/air).
                  </p>
                </div>
              </div>

              {/* Visual Profit Breakdown Bar */}
              <div className="space-y-3 pt-2 pb-1 border-t border-white/10">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-brand-yellow">Alokasi Pendapatan Bulanan:</h4>
                
                {/* Stacked Progress Bar */}
                <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                  {/* COGS Segment */}
                  <div
                    style={{ width: `${cogsPercentage}%` }}
                    className="h-full bg-red-500/80 transition-all duration-500 ease-out"
                    title={`Bahan Baku: ${cogsPercentage}%`}
                  />
                  {/* Operations Cost Segment */}
                  <div
                    style={{ width: `${opsPercentage}%` }}
                    className="h-full bg-amber-500/80 transition-all duration-500 ease-out"
                    title={`Operasional: ${opsPercentage}%`}
                  />
                  {/* Net Profit Segment */}
                  <div
                    style={{ width: `${netProfitPercentage}%` }}
                    className="h-full bg-emerald-500/85 transition-all duration-500 ease-out"
                    title={`Laba Bersih: ${netProfitPercentage}%`}
                  />
                </div>

                {/* Legend Indicators */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] pt-1">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2 h-2 rounded bg-red-500/80 inline-block"></span>
                    <span>Bahan Baku ({cogsPercentage}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2 h-2 rounded bg-amber-500/80 inline-block"></span>
                    <span>Operasional ({opsPercentage}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-2 h-2 rounded bg-emerald-500/85 inline-block"></span>
                    <span className="font-bold text-emerald-400">Laba Bersih ({netProfitPercentage}%)</span>
                  </div>
                </div>
              </div>

              <div className="bg-brand-red/20 border border-brand-red/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-extrabold text-base text-white">Lama Balik Modal (ROI)</h4>
                  <p className="text-xs text-red-100">
                    Berdasarkan investasi modal awal paket {formatCurrency(initialInvestment)}.
                  </p>
                </div>
                <div className="bg-brand-yellow text-black px-6 py-3.5 rounded-xl font-black text-2xl shadow-md whitespace-nowrap text-center">
                  {roiMonths !== "N/A" ? `${roiMonths} Bulan` : "N/A"}
                </div>
              </div>
            </div>

            {/* Download Pitch Deck Button */}
            <div className="lg:col-span-12 text-center pt-6">
              <button
                onClick={openDownloadModal}
                className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Proposal Kemitraan (PDF)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="py-16 bg-white bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Langkah Mudah Bergabung</h2>
            <p className="text-gray-500 text-sm md:text-base">Proses terstruktur pembukaan outlet kemitraan baru Anda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-premium hover:shadow-premium-hover hover-scale-premium relative transition-all duration-300 group"
              >
                <span className="text-5xl font-extrabold text-brand-red/10 absolute top-4 right-6 select-none group-hover:text-brand-red/20 group-hover:scale-105 transition-all duration-300">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-brand-dark mb-2 mt-4 group-hover:text-brand-red transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION) */}
      <section className="py-16 md:py-24 bg-gray-50 border-t border-b border-gray-100 bg-grid-pattern-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Tanya Jawab Kemitraan</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Pertanyaan Umum (FAQ)</h2>
            <div className="h-1 w-12 bg-brand-red mx-auto rounded-full mt-3"></div>
          </div>

          <div className="space-y-4">
            {(faqList.length > 0 ? faqList : faqs).map((faq, index) => {

              const isOpen = activeFAQIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-premium hover:border-brand-red/10 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-brand-dark hover:text-brand-red transition-colors duration-200 focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm md:text-base leading-snug">{faq.question}</span>
                    <span className={`p-1 bg-gray-50 rounded-lg text-gray-500 transition-transform duration-300 shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-350 ease-in-out overflow-hidden ${isOpen ? "max-h-[300px] border-t border-gray-100" : "max-h-0"
                      }`}
                  >
                    <p className="p-6 text-gray-500 text-xs md:text-sm leading-relaxed bg-gray-50/50">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Red Section for Emphasis with CTA */}
      <section className="bg-brand-red text-white py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-[#8d1c1c] via-brand-red to-[#a61e1e]">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-black/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 md:space-y-8 relative z-10">
          <span className="bg-white/10 text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block">
            Mulai Bisnis Suksesmu
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Miliki Outlet Ayapi Krispi Bakar Sekarang!
          </h2>
          <p className="text-lg md:text-xl text-red-100 leading-relaxed max-w-2xl mx-auto">
            Kuota kemitraan terbatas untuk setiap area/kecamatan. Segera hubungi kami untuk mengamankan wilayah eksklusif Anda sebelum diambil orang lain!
          </p>
          <div className="pt-2">
            <Link
              href="/kontak"
              className="bg-brand-yellow hover:bg-[#e0a800] text-black font-extrabold uppercase tracking-widest px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-block text-sm"
            >
              Gabung Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* DOWNLOAD PROPOSAL MODAL POP-UP */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDownloadModalOpen(false)}
          ></div>

          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full z-10 shadow-2xl border border-gray-100 relative animate-fade-in space-y-6">
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-dark p-1 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {isDownloadSubmitted ? (
              <div className="text-center space-y-6 py-4 animate-fade-in">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-brand-dark">Pendaftaran Berhasil!</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Data Anda telah terdaftar sebagai calon mitra. Silakan pilih langkah selanjutnya di bawah ini:
                  </p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <button
                    onClick={triggerPdfDownload}
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-4 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Unduh Proposal (PDF)
                  </button>

                  <button
                    onClick={triggerWhatsAppChat}
                    className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold uppercase tracking-widest py-4 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.861-6.918C16.626 2.062 14.17 1.043 11.56 1.043c-5.443 0-9.865 4.386-9.867 9.782-.001 1.77.476 3.498 1.38 5.061L1.96 21.05l5.244-1.378zm11.385-6.85c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-1.205-.6-2.015-1.112-2.823-2.507-.213-.368-.213-.7-.076-.875.124-.15.275-.325.412-.49.137-.162.18-.275.273-.45.093-.188.046-.35-.022-.5-.069-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.369-.007-.565-.007-.196 0-.517.074-.788.374-.27.3-1.03 1.01-1.03 2.46s1.055 2.85 1.202 3.05c.148.2 2.077 3.17 5.034 4.45.703.303 1.25.485 1.678.62.707.224 1.35.193 1.86.117.567-.085 1.77-.724 2.02-1.41.25-.688.25-1.275.175-1.41-.075-.137-.275-.212-.575-.362z" />
                    </svg>
                    Tanya via WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-lg text-brand-dark">Unduh Proposal Franchise</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Silakan lengkapi formulir singkat di bawah untuk langsung mengunduh berkas presentasi kemitraan resmi Ayapi (PDF).
                  </p>
                </div>

                <form onSubmit={handleDownloadSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="downloadName" className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="downloadName"
                      required
                      value={downloadName}
                      onChange={(e) => setDownloadName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="downloadPhone" className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                      Nomor HP / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      id="downloadPhone"
                      required
                      value={downloadPhone}
                      onChange={(e) => setDownloadPhone(e.target.value)}
                      placeholder="Contoh: 0812XXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Kirim & Dapatkan PDF
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
