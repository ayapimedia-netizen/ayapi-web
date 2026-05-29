"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { addPartnershipLead } from "@/app/actions";

type PackageDetail = {
  id: "express" | "mini" | "premium";
  name: string;
  priceText: string;
  priceValue: number;
  description: string;
  badge?: string;
  image: string;
  inclusions: string[];
};

const packages: PackageDetail[] = [
  {
    id: "express",
    name: "Express",
    priceText: "50 Juta*",
    priceValue: 50000000,
    description: "Memulai bisnis Ayapi dengan konsep praktis menggunakan rombong. Paket ini dirancang untuk lokasi strategis seperti pinggir jalan, perumahan, atau bazar dengan fokus penjualan take away.",
    image: "/express_booth_mockup.png",
    inclusions: [
      "Rombong / Booth Express Semi-Kontainer",
      "Peralatan Masak & Penggorengan Lengkap",
      "Starter Kit Bahan Baku Awal (Ayam & Bumbu)",
      "Media Promosi Fisik (Banner, X-Banner)",
      "Sistem Kasir Digital (POS) & Pelatihan Staf",
      "Pendaftaran Delivery Online (GoFood/GrabFood)",
    ],
  },
  {
    id: "mini",
    name: "Mini Resto",
    priceText: "150 Juta*",
    priceValue: 150000000,
    description: "Hadir dengan konsep outlet yang lebih rapi dan profesional, Mini Resto memungkinkan Anda melayani dine-in terbatas sekaligus take away. Sangat cocok untuk area kampus, perumahan padat, atau ruko kecil.",
    badge: "Terpopuler",
    image: "/mini_resto_mockup.png",
    inclusions: [
      "Booth Kontainer / Renovasi Ruko Mini Premium",
      "Peralatan Dapur Restoran Standar Lengkap",
      "Meja & Kursi Pelanggan (Dine-in Terbatas)",
      "Starter Kit Bahan Baku Skala Menengah",
      "Sistem POS Cloud & Tablet Kasir Lengkap",
      "Seragam Karyawan & Manual Book SOP",
      "Marketing Launching & Support Sosial Media",
    ],
  },
  {
    id: "premium",
    name: "Premium Resto",
    priceText: "250 Juta*",
    priceValue: 250000000,
    description: "Konsep restoran dengan kapasitas dine-in yang lebih luas dan tampilan yang lebih premium. Ideal untuk area strategis dengan traffic tinggi seperti pusat kota atau kawasan komersial.",
    image: "/premium_resto_mockup.png",
    inclusions: [
      "Desain Interior & Renovasi Outlet Premium Lengkap",
      "Peralatan Dapur Komersial Stainless Steel",
      "Kapasitas Dine-in Nyaman (Hingga 30+ Kursi)",
      "SOP Lengkap & Pelatihan Manajemen Supervisor",
      "Integrasi POS & Manajemen Inventori Real-time",
      "Kampanye Grand Opening & Influencer Marketing",
      "Pendampingan Grand Opening oleh Tim Pusat",
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

type FAQItem = {
  question: string;
  answer: string;
};

export default function Kemitraan() {
  const [selectedPackage, setSelectedPackage] = useState<"express" | "mini" | "premium">("express");

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

  const handleSelectPackage = (pkg: "express" | "mini" | "premium") => {
    setSelectedPackage(pkg);
    if (pkg === "express") {
      setDailySales(100);
      setCustomRent(1500000);
      setCustomSalaries(3000000);
      setCustomUtilities(1500000);
    } else if (pkg === "mini") {
      setDailySales(180);
      setCustomRent(5000000);
      setCustomSalaries(7000000);
      setCustomUtilities(3000000);
    } else {
      setDailySales(260);
      setCustomRent(10000000);
      setCustomSalaries(10000000);
      setCustomUtilities(5000000);
    }
    
    // Scroll smoothly to the calculator section
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

    // Save lead to database
    try {
      await addPartnershipLead({
        name: downloadName.trim(),
        phone: downloadPhone.trim(),
      });
    } catch (dbErr) {
      console.error("Gagal menyimpan prospek ke database:", dbErr);
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = "/proposal-kemitraan-ayapi.pdf";
    link.download = "Proposal-Kemitraan-Ayapi.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Notify CS/Owner via WhatsApp
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6287777652032";
    const messageTemplate =
      `Halo Tim Kemitraan Ayapi!\n` +
      `Saya baru saja mengunduh proposal kemitraan via website.\n\n` +
      `*Nama:* ${downloadName}\n` +
      `*No. HP/WA:* ${downloadPhone}\n\n` +
      `Mohon info lebih lanjut ya. Terima kasih!`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(messageTemplate)}`;
    window.open(waUrl, "_blank");

    // Reset
    setIsDownloadModalOpen(false);
    setDownloadName("");
    setDownloadPhone("");
  };

  // Financial Constants
  const initialInvestment =
    selectedPackage === "express" ? 50000000 :
    selectedPackage === "mini" ? 150000000 : 250000000;

  const fixedOpsCost = isCustomOps
    ? customRent + customSalaries + customUtilities
    : selectedPackage === "express" ? 6000000 :
      selectedPackage === "mini" ? 15000000 : 25000000;

  const cogsPercent = 0.55; // 55% HPP

  // Financial Calculations
  const monthlyRevenue = dailySales * avgPrice * 30;
  const cogsCost = monthlyRevenue * cogsPercent;
  const grossProfit = monthlyRevenue - cogsCost;
  const netProfit = Math.max(0, grossProfit - fixedOpsCost);

  const roiMonths = netProfit > 0 ? (initialInvestment / netProfit).toFixed(1) : "N/A";

  const benefits: Benefit[] = [
    {
      title: "Modal Terjangkau",
      description: "Investasi kemitraan relatif kecil (mulai dari Rp 15 Juta) dengan perhitungan return on investment (ROI) cepat, rata-rata kurang dari 6 bulan.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Permintaan Tinggi",
      description: "Ayam krispi bakar adalah makanan pokok populer di Indonesia. Market share luas mulai dari anak-anak hingga dewasa.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: "Sistem Teruji & Support",
      description: "SOP operasional yang matang, pasokan bumbu rahasia pusat terpusat yang konsisten, serta dukungan marketing digital berkala gratis.",
      icon: (
        <svg className="w-8 h-8 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

  return (
    <div className="w-full bg-white">
      {/* Intro Hero Section */}
      <section className="py-16 md:py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
            Peluang Investasi Kemitraan
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4 tracking-tight">
            Kemitraan Ayapi
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Bergabunglah bersama kami dan miliki bisnis ayam krispi bakar yang menguntungkan, mudah dijalankan, dan didukung penuh oleh manajemen berpengalaman.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Mengapa Memilih Ayapi?</h2>
            <p className="text-gray-500 text-sm md:text-base">Keunggulan model bisnis franchise kemitraan kami dibandingkan yang lain.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col space-y-4"
              >
                <div className="p-3.5 bg-brand-red/5 rounded-2xl self-start">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-brand-dark">{benefit.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilihan Paket Kemitraan */}
      <section className="py-16 md:py-24 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3">
              Tipe & Pilihan Outlet
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight">
              Pilihan Paket Investasi Kemitraan
            </h2>
            <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Sesuaikan skala bisnis Anda dengan berbagai model kemitraan yang kami tawarkan. Mulai dari booth praktis hingga restoran premium yang lengkap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {packages.map((pkg) => {
              const isPopular = pkg.id === "mini";
              const isSelected = selectedPackage === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-xl ${
                    isPopular ? "border-brand-red/40 ring-1 ring-brand-red/35" : "border-gray-100"
                  } ${isSelected ? "ring-2 ring-brand-red border-transparent" : ""}`}
                >
                  {isPopular && (
                    <div className="absolute top-4 right-4 bg-brand-red text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full z-10 shadow-sm animate-pulse">
                      Terpopuler
                    </div>
                  )}
                  
                  {/* Mockup Image */}
                  <div className="relative h-60 w-full overflow-hidden bg-gray-50">
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, 33vw"
                      priority={pkg.id === "express"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-2xl font-black text-brand-dark tracking-tight uppercase">
                        {pkg.name}
                      </h3>
                      <div className="flex items-baseline mt-1 text-brand-red">
                        <span className="text-3xl font-black tracking-tight">{pkg.priceText.replace("*", "")}</span>
                        <span className="text-xs font-semibold text-gray-400 ml-1">* Investasi</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-6">
                      {pkg.description}
                    </p>

                    <div className="h-px bg-gray-100 mb-6"></div>

                    <h4 className="text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-3">
                      Inklusi Paket:
                    </h4>

                    <ul className="space-y-2.5 mb-8 flex-grow">
                      {pkg.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start text-xs text-gray-600 gap-2.5">
                          <span className="p-0.5 bg-green-50 rounded-full shrink-0 text-green-600 mt-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="leading-snug">{inc}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPackage(pkg.id)}
                      className={`w-full py-4 rounded-xl text-xs uppercase font-black tracking-widest transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${
                        isSelected
                          ? "bg-brand-dark hover:bg-black text-white"
                          : "bg-brand-red hover:bg-[#a01c1c] text-white"
                      }`}
                    >
                      Saya Mau Paket {pkg.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perbandingan Franchise Section */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
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

          <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border border-gray-200/80 shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-dark text-white text-xs sm:text-sm font-bold">
                    <th className="p-4 sm:p-5 w-1/3">Fitur / Keunggulan</th>
                    <th className="p-4 sm:p-5 bg-brand-red text-center w-1/3">AYAPI Krispi Bakar</th>
                    <th className="p-4 sm:p-5 text-center text-gray-300 w-1/3">Franchise Ayam Lain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-700">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-brand-dark">Royalty Fee Bulanan</td>
                    <td className="p-4 sm:p-5 text-center font-black text-green-600 bg-brand-red/5">
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
                    <td className="p-4 sm:p-5 text-center font-black text-green-600 bg-brand-red/5">
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
      <section id="roi-calculator" className="py-16 md:py-24 bg-brand-light border-t border-b border-gray-100">
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
            <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm space-y-8">
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
            <div className="lg:col-span-7 bg-brand-dark text-white p-8 rounded-3xl shadow-xl space-y-8 relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl -z-10"></div>

              <h3 className="font-bold text-lg border-b border-white/10 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                Proyeksi Keuangan Bulanan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Gross Income Card */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1.5">
                  <span className="text-xs text-gray-400 font-medium">Pendapatan Kotor Bulanan</span>
                  <p className="text-xl md:text-2xl font-extrabold text-white">{formatCurrency(monthlyRevenue)}</p>
                </div>

                {/* COGS (HPP) Card */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1.5">
                  <span className="text-xs text-gray-400 font-medium">Estimasi HPP Bahan Baku (55%)</span>
                  <p className="text-xl md:text-2xl font-extrabold text-red-300">{formatCurrency(cogsCost)}</p>
                </div>

                {/* Net Income Card */}
                <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1.5 sm:col-span-2">
                  <span className="text-xs text-brand-yellow font-bold uppercase tracking-wider">Estimasi Laba Bersih Bulanan (Milik Anda)</span>
                  <p className="text-3xl md:text-4xl font-black text-brand-yellow">{formatCurrency(netProfit)}</p>
                  <p className="text-[10px] text-gray-400 leading-normal pt-1">
                    *Laba Bersih sudah dikurangi biaya operasional bulanan (biaya sewa, gaji staf, utilitas listrik/air).
                  </p>
                </div>
              </div>

              {/* Payback period indicator */}
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
                onClick={() => setIsDownloadModalOpen(true)}
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Langkah Mudah Bergabung</h2>
            <p className="text-gray-500 text-sm md:text-base">Proses terstruktur pembukaan outlet kemitraan baru Anda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
                <span className="text-5xl font-extrabold text-brand-red/10 absolute top-4 right-6 select-none">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-brand-dark mb-2 mt-4">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION) */}
      <section className="py-16 md:py-24 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Tanya Jawab Kemitraan</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Pertanyaan Umum (FAQ)</h2>
            <div className="h-1 w-12 bg-brand-red mx-auto rounded-full mt-3"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFAQIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm transition-all duration-300"
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
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[300px] border-t border-gray-100" : "max-h-0"
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
      <section className="bg-brand-red text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 md:space-y-8">
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
              className="bg-brand-yellow hover:bg-[#e0a800] text-black font-extrabold uppercase tracking-widest px-10 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 inline-block text-sm"
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
            {/* Close Button */}
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-dark p-1 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

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
          </div>
        </div>
      )}
    </div>
  );
}
