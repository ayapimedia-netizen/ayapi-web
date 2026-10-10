"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  addPartnershipLead,
  getPartnershipPackages,
  getFaqs,
  getAllSiteSettings,
  getTestimonials,
  PartnershipPackage,
  FAQItem,
  Testimonial,
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

const defaultPackages: PackageDetail[] = [
  {
    id: "express-1",
    package_key: "express-1",
    name: "Paket Express 1",
    priceText: "15 JUTA*",
    priceValue: 15000000,
    originalPrice: "20 JUTA",
    dimensions: "125 x 60 x 200 cm",
    group: "express",
    description:
      "Lebih Ringkas, Tetap Menarik! Dimensi Rombong: 100 x 60 x 160 cm. Konsep praktis, hemat tempat, cocok untuk pemula dan lokasi padat lalu lintas.",
    badge: "Budget Friendly",
    image: "/packages/booth-kuning-1.jpg",
    inclusions: [
      "Rombong Express Ringkas (125 x 60 x 200 cm)",
      "Peralatan Lengkap & Display Etalase Luas",
      "Starter Kit Bahan Baku Skala Menengah",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Terdaftar di Platform Pesan Antar Online",
      "Kampanye Marketing & Influencer Launching",
    ],
  },
  {
    id: "express-2",
    package_key: "express-2",
    name: "Paket Express 2",
    priceText: "28 JUTA*",
    priceValue: 28000000,
    originalPrice: "35 JUTA",
    dimensions: "200 x 190 x 220 cm",
    group: "express",
    description:
      "Rombong Lebih Luas, Tampilan Lebih Maksimal! Dimensi Rombong: 125 x 60 x 200 cm. Kapasitas display etalase lebih luas untuk omzet harian lebih tinggi.",
    badge: "Best Value!",
    image: "/packages/booth-kuning-2.jpg",
    inclusions: [
      "Rombong Express Ringkas (125 x 60 x 200 cm)",
      "Peralatan Lengkap & Display Etalase Luas",
      "Starter Kit Bahan Baku Skala Menengah",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Terdaftar di Platform Pesan Antar Online",
      "Kampanye Marketing & Influencer Launching",
    ],
  },
  {
    id: "resto-1",
    package_key: "resto-1",
    name: "Paket Resto 1",
    priceText: "90 JUTA*",
    priceValue: 90000000,
    originalPrice: "100 JUTA",
    dimensions: "4 x 6 METER",
    group: "resto",
    description:
      "Resto minimalis & fungsional. Ukuran: 4 x 6 METER. Solusi ideal menghadirkan pengalaman dine-in hemat namun tetap nyaman dan estetik.",
    badge: "Resto Minimalis",
    image: "/packages/resto-outlet-1.jpg",
    inclusions: [
      "Layout Outlet Minimalis & Fungsional (4 x 6 M)",
      "Set Meja & Kursi Dine-in Pelanggan",
      "Set Peralatan Resto & Dapur Lengkap",
      "Starter Kit Bahan Baku & Bumbu Rempah",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Terdaftar di Platform Pesan Antar Online",
      "Pendampingan operasional",
      "Kampanye Marketing & Influencer Launching",
    ],
  },
  {
    id: "resto-2",
    package_key: "resto-2",
    name: "Paket Resto 2",
    priceText: "135 JUTA*",
    priceValue: 135000000,
    originalPrice: "150 JUTA",
    dimensions: "5 x 7 METER",
    group: "resto",
    description:
      "Resto modern & lebih luas. Ukuran: 5 x 7 METER. Menampung lebih banyak pelanggan dengan atmosfer modern dan operasional yang efisien.",
    badge: "Resto Modern",
    image: "/packages/resto-outlet-2.jpg",
    inclusions: [
      "Layout Outlet Modern & Luas (5 x 7 M)",
      "Set Meja & Kursi Dine-in Pelanggan",
      "Set Peralatan Resto & Dapur Lengkap",
      "Starter Kit Bahan Baku & Bumbu Rempah",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Terdaftar di Platform Pesan Antar Online",
      "Pendampingan operasional",
      "Kampanye Marketing & Influencer Launching",
    ],
  },
  {
    id: "resto-3",
    package_key: "resto-3",
    name: "Paket Resto 3",
    priceText: "180 JUTA*",
    priceValue: 180000000,
    originalPrice: "200 JUTA",
    dimensions: "6 x 8 METER",
    group: "resto",
    description:
      "Resto premium & full experience. Ukuran: 6 x 8 METER. Konsep flagship resto dengan kapasitas maksimal, interior mewah, dan pengalaman kuliner terlengkap.",
    badge: "Full Experience",
    image: "/packages/resto-outlet-3.jpg",
    inclusions: [
      "Desain Interior & Renovasi Full Experience (6 x 8 M)",
      "Kapasitas Dine-in Luas & Nyaman (30+ Kursi)",
      "Peralatan Dapur Premium Kapasitas Maksimal",
      "Paket Bahan Baku Terlengkap",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Terdaftar di Platform Pesan Antar Online",
      "Pendampingan operasional",
      "Pendampingan Grand Opening Tim Pusat",
      "Kampanye Marketing & Influencer Launching",
    ],
  },
];

type Pillar = {
  num: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const pillars: Pillar[] = [
  {
    num: "01",
    title: "Brand yang Mudah Dikenal",
    description:
      "AYAPI hadir dengan konsep ayam geprek dan kuliner yang dekat dengan selera masyarakat Indonesia. Identitas brand yang kuat membantu mitra membangun bisnis dengan lebih mudah.",
    icon: (
      <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Produk Favorit & Harga Kompetitif",
    description:
      "Menu AYAPI dirancang untuk menjangkau pasar yang luas, dengan pilihan produk yang familiar, lezat, dan memiliki harga yang kompetitif untuk kebutuhan sehari-hari.",
    icon: (
      <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Sistem Bisnis yang Terstruktur",
    description:
      "Mitra mendapatkan sistem operasional yang telah disiapkan, mulai dari standar pelayanan, SOP, pengelolaan outlet, hingga panduan menjalankan bisnis secara lebih terarah.",
    icon: (
      <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Support Marketing & Promosi",
    description:
      "AYAPI membantu mitra dalam membangun awareness dan menarik pelanggan melalui strategi marketing, materi promosi, campaign, serta aktivasi yang dapat disesuaikan dengan karakter pasar setiap outlet.",
    icon: (
      <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Pendampingan untuk Pertumbuhan",
    description:
      "Kemitraan AYAPI tidak berhenti setelah outlet dibuka. Mitra mendapatkan pendampingan dan evaluasi untuk membantu mengoptimalkan operasional, pemasaran, dan perkembangan bisnis secara berkelanjutan.",
    icon: (
      <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

type Step = {
  step: string;
  title: string;
  desc: string;
};

const steps: Step[] = [
  {
    step: "01",
    title: "Hubungi Kontak",
    desc: "Konsultasikan lokasi dan ketertarikan Anda melalui tim marketing kemitraan kami.",
  },
  {
    step: "02",
    title: "Survei & Analisis",
    desc: "Tim kami akan menganalisis lokasi outlet potensial Anda secara komprehensif.",
  },
  {
    step: "03",
    title: "Tanda Tangan & Administrasi",
    desc: "Melakukan penandatanganan kemitraan resmi dan administrasi investasi.",
  },
  {
    step: "04",
    title: "Pelatihan & Grand Opening",
    desc: "Pengiriman booth/perlengkapan resto, training SOP staf, dan pendampingan pembukaan.",
  },
];

const faqs: FAQItem[] = [
  {
    question: "Apakah bumbu rahasia disediakan oleh pusat?",
    answer:
      "Ya, semua bumbu rahasia marinasi ayam dan saus bakar disuplai dari pusat dalam bentuk kemasan praktis untuk menjaga konsistensi cita rasa khas Ayapi di semua cabang.",
  },
  {
    question: "Berapa lama estimasi waktu dari tanda tangan kontrak hingga outlet buka?",
    answer:
      "Proses lengkap rata-rata memakan waktu 2 hingga 4 minggu, meliputi survei lokasi, pengiriman rombong/alat, pelatihan SOP karyawan, hingga persiapan Grand Opening.",
  },
  {
    question: "Apakah ada royalti fee bulanan?",
    answer:
      "Tidak. Ayapi menggunakan sistem kemitraan tanpa bagi hasil bulanan (0% royalty fee). Semua keuntungan bersih yang diperoleh dari outlet sepenuhnya milik mitra.",
  },
  {
    question: "Bagaimana dengan pencarian lokasi dan karyawan?",
    answer:
      "Pencarian lokasi dan karyawan dibantu oleh tim analis kami untuk memastikan kelayakan titik outlet dan materi pelatihan lengkap untuk karyawan Anda.",
  },
  {
    question: "Apakah boleh menjual menu di luar menu resmi Ayapi?",
    answer:
      "Demi menjaga standardisasi brand dan kualitas rasa, mitra dilarang keras menjual menu makanan berat di luar menu resmi yang dikeluarkan oleh pusat Ayapi.",
  },
];

export default function Kemitraan() {
  const [selectedPackage, setSelectedPackage] = useState<string>("express-1");
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<"all" | "express" | "resto">("all");

  // Dynamic DB States
  const [pkgList, setPkgList] = useState<PartnershipPackage[]>([]);
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const [pkgs, faqsData, settingsData, reviews] = await Promise.all([
          getPartnershipPackages(),
          getFaqs(),
          getAllSiteSettings(),
          getTestimonials(),
        ]);
        if (pkgs && pkgs.length > 0) setPkgList(pkgs);
        if (faqsData && faqsData.length > 0) setFaqList(faqsData);
        if (settingsData) setSiteSettings(settingsData);
        if (reviews && reviews.length > 0) setTestimonialsList(reviews);
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
    if (pkgKey.includes("express-1") || pkgKey === "express-1") {
      setDailySales(80);
      setCustomRent(1200000);
      setCustomSalaries(2500000);
      setCustomUtilities(1200000);
    } else if (pkgKey.includes("express-2") || pkgKey === "express-2") {
      setDailySales(120);
      setCustomRent(1800000);
      setCustomSalaries(3500000);
      setCustomUtilities(1800000);
    } else if (pkgKey.includes("resto-1") || pkgKey === "resto-1") {
      setDailySales(160);
      setCustomRent(4000000);
      setCustomSalaries(6000000);
      setCustomUtilities(2500000);
    } else if (pkgKey.includes("resto-2") || pkgKey === "resto-2") {
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
      `Saya tertarik dan ingin konsultasi kemitraan Ayapi (Paket: ${selectedPackage}).\n\n` +
      `*Nama:* ${downloadName || "-"}\n` +
      `*No. HP/WA:* ${downloadPhone || "-"}\n\n` +
      `Mohon info ketersediaan lokasi dan prospek kemitraan. Terima kasih!`;

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
  const activePackagesList = defaultPackages;

  const activeSelectedPkgObj =
    activePackagesList.find((p) => (p.package_key || p.id) === selectedPackage) || activePackagesList[0];

  const initialInvestment = activeSelectedPkgObj ? activeSelectedPkgObj.priceValue : 15000000;

  const fixedOpsCost = isCustomOps
    ? customRent + customSalaries + customUtilities
    : selectedPackage.includes("express-1")
      ? 4900000
      : selectedPackage.includes("express-2")
        ? 7100000
        : selectedPackage.includes("resto-1")
          ? 12500000
          : selectedPackage.includes("resto-2")
            ? 20000000
            : 32000000;

  const rawCogsVal = siteSettings.roi_cogs_percent ? parseFloat(siteSettings.roi_cogs_percent) : 55;
  const cogsPercent = rawCogsVal / 100;

  // Financial Calculations
  const monthlyRevenue = dailySales * avgPrice * 30;
  const cogsCost = monthlyRevenue * cogsPercent;
  const grossProfit = monthlyRevenue - cogsCost;
  const rawNetProfit = grossProfit - fixedOpsCost;
  const isLoss = rawNetProfit < 0;
  const isBreakEven = rawNetProfit === 0;

  // Margin per portion to calculate minimum break-even sales:
  const marginPerPortion = avgPrice * (1 - cogsPercent);
  const bepMonthlyPortions = marginPerPortion > 0 ? Math.ceil(fixedOpsCost / marginPerPortion) : 0;
  const bepDailyPortions = Math.ceil(bepMonthlyPortions / 30);

  const roiMonths = rawNetProfit > 0 ? (initialInvestment / rawNetProfit).toFixed(1) : null;

  const cogsPercentage = Math.round(rawCogsVal);
  const rawOpsPercentage = monthlyRevenue > 0 ? Math.round((fixedOpsCost / monthlyRevenue) * 100) : 0;
  const opsPercentage = Math.min(100 - cogsPercentage, rawOpsPercentage);
  const netProfitPercentage = rawNetProfit > 0 ? Math.max(0, 100 - cogsPercentage - opsPercentage) : 0;
  const deficitPercentage = isLoss && monthlyRevenue > 0 ? Math.round((Math.abs(rawNetProfit) / monthlyRevenue) * 100) : 0;

  const formatCurrency = (value: number) => {
    return "Rp " + value.toLocaleString("id-ID");
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQIndex(activeFAQIndex === index ? null : index);
  };

  const filteredPackages = activePackagesList.filter((pkg) => {
    if (packageCategoryFilter === "all") return true;
    return pkg.group === packageCategoryFilter;
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
            Paket Kemitraan AYAPI Express & AYAPI Krispi Bakar
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-6"></div>
          <h2 className="text-xl md:text-2xl font-bold text-brand-red mb-3">
            Saatnya Punya Bisnis Kuliner Bersama AYAPI
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Hadir dengan konsep bisnis yang siap dijalankan, produk yang dekat dengan selera pasar, sistem operasional terstruktur, serta dukungan marketing dan manajemen untuk mendampingi Anda dari persiapan outlet hingga pengembangan bisnis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#paket-investasi"
              className="bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Lihat Paket Investasi
            </a>
            <button
              onClick={openDownloadModal}
              className="bg-white border border-gray-300 hover:border-brand-red text-brand-dark font-extrabold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-sm hover:shadow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Proposal (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* 5 Pillars: Mengapa Memilih Ayapi? */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
              Keunggulan Kemitraan
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">Mengapa Memilih Ayapi?</h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base">
              5 Pilar utama yang membuat bisnis kemitraan AYAPI siap dijalankan dan berkelanjutan.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="bg-white p-7 rounded-3xl border border-gray-200/80 shadow-premium hover:shadow-premium-hover hover-scale-premium transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-brand-red/5 rounded-2xl">
                      {pillar.icon}
                    </div>
                    <span className="text-3xl font-black text-brand-red/20 group-hover:text-brand-red/40 transition-colors">
                      {pillar.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-dark group-hover:text-brand-red transition-colors mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed text-justify">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Paket Investasi Kemitraan */}
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
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Sesuaikan model kemitraan Anda. Mulai dari Rombong Express praktis dan hemat hingga Restoran modern dengan pengalaman kuliner terlengkap.
            </p>

            {/* Filter Category Tabs */}
            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
              <button
                onClick={() => setPackageCategoryFilter("all")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${packageCategoryFilter === "all"
                    ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red"
                  }`}
              >
                Semua Paket ({activePackagesList.length})
              </button>
              <button
                onClick={() => setPackageCategoryFilter("express")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${packageCategoryFilter === "express"
                    ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red"
                  }`}
              >
                🛒 Paket Express ({activePackagesList.filter((p) => p.group === "express").length})
              </button>
              <button
                onClick={() => setPackageCategoryFilter("resto")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${packageCategoryFilter === "resto"
                    ? "bg-brand-red text-white shadow-md shadow-brand-red/20 scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-brand-red/40 hover:text-brand-red"
                  }`}
              >
                🏪 Paket Resto ({activePackagesList.filter((p) => p.group === "resto").length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 lg:gap-10">
            {filteredPackages.map((pkg) => {
              const pKey = pkg.package_key || pkg.id;
              const isSelected = selectedPackage === pKey;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-premium hover:shadow-premium-hover w-full md:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.75rem)] max-w-md ${pkg.badge ? "border-brand-red/40 ring-1 ring-brand-red/35" : "border-gray-200/80"
                    } ${isSelected ? "ring-2 ring-brand-red border-transparent shadow-xl" : ""}`}
                >
                  {/* Category Pill Top Left */}
                  <div className="absolute top-4 left-4 bg-brand-dark/80 backdrop-blur-md text-white text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full z-10 shadow-sm border border-white/10">
                    {pkg.group === "express" ? "PAKET EXPRESS" : "PAKET RESTO"}
                  </div>

                  {/* Badge Top Right */}
                  {pkg.badge && (
                    <div className="absolute top-4 right-4 bg-brand-red text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full z-10 shadow-sm">
                      {pkg.badge}
                    </div>
                  )}

                  {/* Mockup Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 border-b border-gray-100 shrink-0">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
                      priority={pKey === "express-1"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="mb-4">
                        <h3 className="text-2xl font-black text-brand-dark tracking-tight uppercase">
                          {pkg.name}
                        </h3>

                        {/* Pricing Block with Strikethrough */}
                        <div className="mt-2">
                          {pkg.originalPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 line-through font-bold">{pkg.originalPrice}</span>
                              <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase">PROMO SPESIAL</span>
                            </div>
                          )}
                          <div className="flex items-baseline text-brand-red mt-0.5">
                            <span className="text-3xl font-black tracking-tight">{pkg.priceText.replace("*", "")}</span>
                            <span className="text-xs font-semibold text-gray-400 ml-1.5">* Investasi</span>
                          </div>
                        </div>

                        {/* Dimension / Ukuran Badge */}
                        {pkg.dimensions && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] font-extrabold text-amber-900">
                            <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            <span>Dimensi: {pkg.dimensions}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6 text-justify">
                        {pkg.description}
                      </p>

                      <div className="h-px bg-gray-100 mb-6"></div>

                      <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-3">
                        Sudah termasuk :
                      </h4>

                      <ul className="space-y-2.5 mb-8">
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
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        onClick={() => handleSelectPackage(pKey)}
                        className={`w-full py-4 rounded-xl text-xs uppercase font-black tracking-widest transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${isSelected
                            ? "bg-brand-dark hover:bg-black text-white"
                            : "bg-brand-red hover:bg-[#a01c1c] text-white"
                          }`}
                      >
                        {isSelected ? "✓ Paket Dipilih (Hitung ROI)" : `Saya Mau ${pkg.name}`}
                      </button>
                    </div>
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
              Analisis komparatif antara bergabung dengan jaringan kemitraan AYAPI dibandingkan dengan waralaba kuliner ayam lainnya.
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
                      Ayam Krispi Bakar (Pelopor Rasa Smoky Gurih)
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
                      Promosi Digital Aktif & Campaign Influencer Launching
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
                  Pilih Paket Kemitraan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/40">
                  {activePackagesList.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`py-2 px-2 rounded-xl text-center font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${selectedPackage === pkg.id
                          ? "bg-brand-red text-white shadow-sm"
                          : "text-gray-500 hover:text-brand-dark hover:bg-gray-200/50"
                        }`}
                    >
                      {pkg.name.replace("Paket ", "")}
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
                  min="30"
                  max="400"
                  step="10"
                  value={dailySales}
                  onChange={(e) => setDailySales(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                />
                <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                  <span>30 Porsi</span>
                  <span>200 Porsi</span>
                  <span>400 Porsi</span>
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
                  min="15000"
                  max="40000"
                  step="1000"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-red"
                />
                <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                  <span>Rp 15.000</span>
                  <span>Rp 27.000</span>
                  <span>Rp 40.000</span>
                </div>
              </div>

              {/* Operational Cost Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomOps(!isCustomOps)}
                  className="text-xs font-bold text-gray-500 hover:text-brand-red flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className={`w-4 h-4 transition-transform ${isCustomOps ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {isCustomOps ? "Sembunyikan Rincian Operasional" : "Sesuaikan Biaya Sewa, Gaji & Operasional"}
                </button>

                {isCustomOps && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500">Sewa Tempat / Bulan</span>
                        <span className="text-brand-dark">{formatCurrency(customRent)}</span>
                      </div>
                      <input
                        type="range"
                        min="500000"
                        max="20000000"
                        step="500000"
                        value={customRent}
                        onChange={(e) => setCustomRent(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-brand-red"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500">Total Gaji Karyawan / Bulan</span>
                        <span className="text-brand-dark">{formatCurrency(customSalaries)}</span>
                      </div>
                      <input
                        type="range"
                        min="1500000"
                        max="25000000"
                        step="500000"
                        value={customSalaries}
                        onChange={(e) => setCustomSalaries(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-brand-red"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-500">Listrik, Gas & Utilitas / Bulan</span>
                        <span className="text-brand-dark">{formatCurrency(customUtilities)}</span>
                      </div>
                      <input
                        type="range"
                        min="500000"
                        max="10000000"
                        step="250000"
                        value={customUtilities}
                        onChange={(e) => setCustomUtilities(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-brand-red"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Output Summary & Metrics */}
            <div className="lg:col-span-7 bg-brand-dark text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="border-b border-white/10 pb-6">
                <span className="text-brand-yellow font-bold text-xs uppercase tracking-wider">
                  Hasil Proyeksi Keuangan: {activeSelectedPkgObj?.name}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-2">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Estimasi Balik Modal
                    </h3>
                    {isLoss ? (
                      <p className="text-xs text-rose-300 font-medium mt-1">
                        Target penjualan belum menutup biaya operasional
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300 font-medium mt-1">
                        Berdasarkan asumsi penjualan dan biaya bulanan
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    {rawNetProfit > 0 ? (
                      <div className="text-3xl sm:text-4xl font-black text-brand-yellow tracking-tight">
                        ± {roiMonths} <span className="text-sm font-bold text-gray-300">Bulan</span>
                      </div>
                    ) : isBreakEven ? (
                      <div className="inline-block px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-base font-extrabold">
                        Titik Impas (BEP)
                      </div>
                    ) : (
                      <div className="inline-flex flex-col items-start sm:items-end">
                        <span className="px-3.5 py-1.5 bg-rose-500/25 border border-rose-500/40 text-rose-300 rounded-xl text-sm sm:text-base font-extrabold tracking-wide">
                          Belum Balik Modal
                        </span>
                        <span className="text-[11px] text-gray-300 font-medium mt-1">
                          Butuh min. <strong className="text-amber-300">{bepDailyPortions} porsi/hari</strong> untuk BEP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Loss / Deficit Recommendation Alert */}
              {isLoss && (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-base shrink-0 mt-0.5">⚠️</span>
                  <div className="text-xs leading-relaxed text-rose-100">
                    <strong className="text-white block font-bold mb-0.5">Penjualan Belum Menutup Beban Biaya:</strong>
                    Dengan estimasi biaya operasional ({formatCurrency(fixedOpsCost)}/bln), penjualan saat ini masih di bawah titik impas. Naikkan target minimal <strong className="text-amber-300 font-bold">{bepDailyPortions} porsi/hari</strong> (atau tekan biaya sewa/operasional) untuk mulai menghasilkan laba bersih.
                  </div>
                </div>
              )}

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                    Omzet Kotor / Bulan
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {formatCurrency(monthlyRevenue)}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    ({dailySales} porsi x 30 hari)
                  </span>
                </div>

                <div
                  className={`p-5 rounded-2xl border transition-colors ${
                    isLoss
                      ? "bg-rose-950/40 border-rose-500/30"
                      : isBreakEven
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-brand-red/20 border-brand-red/30"
                  }`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                      isLoss ? "text-rose-300" : isBreakEven ? "text-amber-400" : "text-brand-yellow"
                    }`}
                  >
                    {isLoss ? "Defisit Operasional / Bulan" : "Estimasi Laba Bersih / Bulan"}
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-black ${
                      isLoss ? "text-rose-400" : isBreakEven ? "text-amber-400" : "text-brand-yellow"
                    }`}
                  >
                    {isLoss ? `- ${formatCurrency(Math.abs(rawNetProfit))}` : formatCurrency(rawNetProfit)}
                  </span>
                  <span className={`text-[10px] block mt-1 ${isLoss ? "text-rose-300/80 font-medium" : "text-red-200"}`}>
                    {isLoss ? "Biaya operasional melampaui gross profit" : "100% milik mitra (0% Royalty)"}
                  </span>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Struktur Biaya & Margin
                  </span>
                  {isLoss && (
                    <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                      Defisit (-{deficitPercentage}%)
                    </span>
                  )}
                </div>
                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div style={{ width: `${cogsPercentage}%` }} className="bg-red-500 h-full" title={`COGS (Bahan Baku): ${cogsPercentage}%`}></div>
                  <div style={{ width: `${opsPercentage}%` }} className="bg-amber-500 h-full" title={`Operasional: ${rawOpsPercentage}%`}></div>
                  {rawNetProfit > 0 && (
                    <div style={{ width: `${netProfitPercentage}%` }} className="bg-green-500 h-full" title={`Laba Bersih: ${netProfitPercentage}%`}></div>
                  )}
                </div>
                <div className="flex flex-wrap justify-between gap-y-1 text-[11px] text-gray-300 font-semibold pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Bahan Baku ({cogsPercentage}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Operasional ({rawOpsPercentage}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isLoss ? "bg-rose-500" : isBreakEven ? "bg-amber-400" : "bg-green-500"
                      }`}
                    ></span>
                    {isLoss ? (
                      <span className="text-rose-400 font-bold">Defisit (-{deficitPercentage}%)</span>
                    ) : (
                      <span>Net Margin ({netProfitPercentage}%)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button in Calculator */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={triggerWhatsAppChat}
                  className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold uppercase tracking-widest py-4 px-6 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.861-6.918C16.626 2.062 14.17 1.043 11.56 1.043c-5.443 0-9.865 4.386-9.867 9.782-.001 1.77.476 3.498 1.38 5.061L1.96 21.05l5.244-1.378zm11.385-6.85c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-1.205-.6-2.015-1.112-2.823-2.507-.213-.368-.213-.7-.076-.875.124-.15.275-.325.412-.49.137-.162.18-.275.273-.45.093-.188.046-.35-.022-.5-.069-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.369-.007-.565-.007-.196 0-.517.074-.788.374-.27.3-1.03 1.01-1.03 2.46s1.055 2.85 1.202 3.05c.148.2 2.077 3.17 5.034 4.45.703.303 1.25.485 1.678.62.707.224 1.35.193 1.86.117.567-.085 1.77-.724 2.02-1.41.25-.688.25-1.275.175-1.41-.075-.137-.275-.212-.575-.362z" />
                  </svg>
                  Konsultasi Paket Ini via WA
                </button>
                <button
                  onClick={openDownloadModal}
                  className="bg-white/10 hover:bg-white/20 text-white font-extrabold uppercase tracking-widest py-4 px-6 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Unduh Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS & TESTIMONIALS SECTION (Moved from Homepage to Kemitraan) */}
      <section className="py-16 md:py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
              Testimoni & Pengalaman
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">
              Apa Kata Mitra & Pelanggan Kami?
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Dengarkan langsung cerita pengalaman para mitra pemilik outlet serta kecintaan pelanggan terhadap cita rasa Ayapi.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {(testimonialsList.length > 0 ? testimonialsList : [
              {
                name: "Indra Kurniawan",
                role: "Mitra Franchise - Bandung",
                rating: 5,
                review: "Keputusan terbaik saya adalah bergabung menjadi mitra Ayapi. Modal awalnya sangat terjangkau, bumbu disuplai terpusat jadi rasa selalu konsisten. Kurang dari 5 bulan outlet saya sudah balik modal!",
                initials: "IK",
                bg_gradient: "from-red-500 to-orange-500",
              },
              {
                name: "Siti Rahma",
                role: "Pelanggan Setia - Bali",
                rating: 5,
                review: "Ayam krispi bakar di sini bener-bener beda! Kulit luarnya garing renyah tapi dagingnya tetap juicy banget. Ditambah saus bakar bumbunya yang meresap sampai ke dalam daging. Langganan keluarga kami!",
                initials: "SR",
                bg_gradient: "from-amber-500 to-yellow-500",
              },
              {
                name: "Rian Hidayat",
                role: "Pecinta Kuliner & Mitra - Bali",
                rating: 5,
                review: "Paket Geprek Krisbar sambalnya juara banget! Pedas rawitnya segar gurih, rasa smoky ayam bakarnya dapet, dan sistem operasionalnya sangat terstruktur untuk pemula yang ingin bisnis.",
                initials: "RH",
                bg_gradient: "from-rose-500 to-red-600",
              },
            ]).map((t, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 p-7 rounded-3xl border border-gray-200/80 shadow-premium flex flex-col justify-between h-full hover-scale-premium transition-all duration-300 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed italic mb-6 text-justify">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60 mt-auto">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.bg_gradient || "from-brand-red to-orange-500"} flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0`}>
                    {t.initials || t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-dark">{t.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="py-16 bg-gray-50 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Langkah Mudah Bergabung</h2>
            <p className="text-gray-500 text-sm md:text-base">Proses terstruktur pembukaan outlet kemitraan baru Anda.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {steps.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-premium hover:shadow-premium-hover hover-scale-premium relative transition-all duration-300 group flex flex-col justify-between h-full w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm"
              >
                <div>
                  <span className="text-5xl font-extrabold text-brand-red/10 absolute top-4 right-6 select-none group-hover:text-brand-red/20 group-hover:scale-105 transition-all duration-300">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-bold text-brand-dark mb-2 mt-4 group-hover:text-brand-red transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed text-justify">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION) */}
      <section className="py-16 md:py-24 bg-white border-t border-b border-gray-100 bg-grid-pattern-light">
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
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={triggerWhatsAppChat}
              className="bg-brand-yellow hover:bg-[#e0a800] text-black font-extrabold uppercase tracking-widest px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-block text-sm cursor-pointer"
            >
              Konsultasi WhatsApp Sekarang
            </button>
            <Link
              href="/kontak"
              className="bg-white/10 hover:bg-white/20 text-white font-extrabold uppercase tracking-widest px-10 py-4 rounded-xl border border-white/20 transition-all duration-200 inline-block text-sm"
            >
              Kirim Pesan
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
                  <h3 className="font-extrabold text-lg text-brand-dark">Unduh Proposal Kemitraan</h3>
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
