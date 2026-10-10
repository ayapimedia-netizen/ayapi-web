"use client";

import React, { useState, useEffect } from "react";
import { getBranches, Branch, addPartnershipLead, getAllSiteSettings } from "@/app/actions";

export default function Kontak() {
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState("kemitraan");
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<Branch[]>([
    {
      name: "Ayapi Tebet, Jakarta Selatan",
      gofood: "",
      grabfood: "",
      shopeefood: "",
    },
    {
      name: "Ayapi Margonda, Depok",
      gofood: "",
      grabfood: "",
      shopeefood: "",
    },
    {
      name: "Ayapi Dago, Bandung",
      gofood: "",
      grabfood: "",
      shopeefood: "",
    },
  ]);

  const [selectedMapBranchIndex, setSelectedMapBranchIndex] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchList, settingsData] = await Promise.all([
          getBranches(),
          getAllSiteSettings(),
        ]);
        if (branchList && branchList.length > 0) {
          setBranches(branchList);
        }
        if (settingsData) {
          setSiteSettings(settingsData);
        }
      } catch (err) {
        console.error("Gagal memuat data kontak:", err);
      }
    };
    fetchData();
  }, []);

  const waNumber = siteSettings.wa_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628213444730";
  const formattedWaNumber = siteSettings.wa_number_formatted || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_FORMATTED || "+62 821-3444-730";
  const csEmail = siteSettings.cs_email || "ayapihr@gmail.com";
  const hqAddress = siteSettings.headquarter_address || "Jl. Diponegoro No.177, Dauh Puri Klod, Kec. Denpasar Bar., Kota Denpasar, Bali 80113";


  const getBranchAddress = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("tebet")) {
      return "Jl. Tebet Raya No. 45, Tebet Timur, Jakarta Selatan, DKI Jakarta 12820";
    }
    if (lowercaseName.includes("margonda")) {
      return "Jl. Margonda Raya No. 112, Kemiri Muka, Kecamatan Beji, Kota Depok, Jawa Barat 16423";
    }
    if (lowercaseName.includes("dago")) {
      return "Jl. Ir. H. Juanda No. 88, Dago, Kecamatan Coblong, Kota Bandung, Jawa Barat 40135";
    }
    return "Cabang resmi Ayapi. Silakan lihat rute Google Maps untuk detail lokasi lengkap.";
  };

  const getBranchRegion = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("bandung") || lowercaseName.includes("dago")) return "Cabang Bandung";
    if (lowercaseName.includes("depok") || lowercaseName.includes("margonda")) return "Cabang Depok";
    if (lowercaseName.includes("jakarta") || lowercaseName.includes("tebet")) return "Cabang Jakarta Selatan";
    return "Cabang Resmi";
  };

  const isBranchOpenNow = (openTime?: string, closeTime?: string) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr?: string, defaultHour = 10) => {
      if (!timeStr) return defaultHour * 60;
      const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
      return (isNaN(h) ? defaultHour : h) * 60 + (isNaN(m) ? 0 : m);
    };

    const openMins = parseTime(openTime, 10);
    const closeMins = parseTime(closeTime, 22);

    if (closeMins < openMins) {
      return currentMinutes >= openMins || currentMinutes < closeMins;
    }
    return currentMinutes >= openMins && currentMinutes < closeMins;
  };

  // Form States
  const [formData, setFormData] = useState({
    // Step 1: Profil
    name: "",
    phone: "",
    email: "",
    // Step 2: Lokasi & Bisnis
    city: "",
    locationStatus: "belum_ada",
    experience: "pemula",
    // Step 3: Finansial & Catatan
    budget: "15_25",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate Step 1 before proceeding
    if (step === 1) {
      if (!formData.name || !formData.phone) {
        alert("Silakan isi Nama Lengkap dan Nomor WhatsApp Anda.");
        return;
      }
    }
    // Validate Step 2
    if (step === 2) {
      if (!formData.city) {
        alert("Silakan isi target kota rencana lokasi usaha Anda.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const phoneRegex = /^(\+62|62|0)8[0-9]{7,12}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmitFranchise = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.city) {
      alert("Silakan lengkapi formulir pendaftaran kemitraan.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      alert("Format nomor WhatsApp tidak valid. Silakan masukkan nomor HP/WhatsApp Indonesia yang benar (contoh: 0812XXXXXXXX).");
      return;
    }

    // Save lead to database
    try {
      await addPartnershipLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });
    } catch (dbErr) {
      console.error("Gagal menyimpan prospek ke database:", dbErr);
    }

    const locationText =
      formData.locationStatus === "ruko" ? "Sudah Ada Ruko" :
        formData.locationStatus === "tanah" ? "Ada Lahan/Lapak" : "Belum Ada (Sedang Mencari)";

    const experienceText =
      formData.experience === "pemula" ? "Pemula" :
        formData.experience === "pernah" ? "Pernah Bisnis" : "Sedang Bisnis Kuliner Lain";

    const budgetText =
      formData.budget === "15_25" ? "Rp 15 Juta - Rp 25 Juta" :
        formData.budget === "25_50" ? "Rp 25 Juta - Rp 50 Juta" : "> Rp 50 Juta";

    const templateMessage =
      `Halo Tim Kemitraan Ayapi!\n` +
      `Saya tertarik mendaftar franchise Kemitraan Ayapi. Berikut data pengajuan saya:\n\n` +
      `*Nama:* ${formData.name}\n` +
      `*No. HP/WA:* ${formData.phone}\n` +
      `*Email:* ${formData.email || "-"}\n` +
      `*Target Kota:* ${formData.city}\n` +
      `*Status Lokasi:* ${locationText}\n` +
      `*Pengalaman Bisnis:* ${experienceText}\n` +
      `*Kesiapan Modal:* ${budgetText}\n\n` +
      (formData.message.trim() ? `*Pesan Tambahan:*\n${formData.message}` : "");

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(templateMessage)}`;
    window.open(waUrl, "_blank");
  };

  const handleSubmitGeneral = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.message) {
      alert("Silakan isi nama dan pesan Anda.");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      alert("Format nomor WhatsApp tidak valid. Silakan masukkan nomor HP/WhatsApp Indonesia yang benar (contoh: 0812XXXXXXXX).");
      return;
    }

    const subjectText =
      subject === "menu" ? "Pertanyaan Menu / Outlet" :
        subject === "katering" ? "Pemesanan Katering" : "Kritik & Saran";

    const templateMessage =
      `Halo Ayapi Krispi Bakar!\n\n` +
      `*Nama:* ${formData.name}\n` +
      `*No. HP/WA:* ${formData.phone || "-"}\n` +
      `*Perihal:* ${subjectText.toUpperCase()}\n\n` +
      `*Pesan:*\n${formData.message}`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(templateMessage)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="w-full relative overflow-hidden bg-grid-pattern-light min-h-screen py-16 md:py-24">
      {/* Background Ambient Glowing Orbs */}
      <div className="ambient-orb animate-orb-1 bg-brand-red w-72 h-72 top-20 left-10 opacity-[0.06]" />
      <div className="ambient-orb animate-orb-2 bg-brand-yellow w-80 h-80 bottom-40 right-10 opacity-[0.06]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-brand-red font-extrabold text-[10px] uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3.5">
            Hubungi Tim Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4 tracking-tight">
            Kontak Kami
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-5"></div>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Ada pertanyaan tentang menu, pemesanan katering, atau tertarik mendaftar kemitraan franchise? Hubungi kami langsung.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto mb-16">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-glass backdrop-blur-md shadow-premium border border-white/40 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-brand-dark mb-3 tracking-tight">Informasi Kontak</h2>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Silakan hubungi kami melalui salah satu saluran berikut, atau kirimkan formulir untuk terhubung langsung via WhatsApp.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-brand-red/5 rounded-2xl text-brand-red shrink-0 border border-brand-red/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-brand-dark text-xs uppercase tracking-wider">Alamat Kantor Pusat</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{hqAddress}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-brand-red/5 rounded-2xl text-brand-red shrink-0 border border-brand-red/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-brand-dark text-xs uppercase tracking-wider">Nomor Telepon / WA</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{formattedWaNumber}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-brand-red/5 rounded-2xl text-brand-red shrink-0 border border-brand-red/10">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-brand-dark text-xs uppercase tracking-wider">Alamat Email</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{csEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-gray-200/50">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold uppercase tracking-widest py-4 rounded-xl text-xs transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                Chat WhatsApp CS
              </a>
            </div>
          </div>

          {/* Right: Interactive Forms */}
          <div className="lg:col-span-7 bg-glass backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-premium flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-150/40">
                <h2 className="text-xl font-extrabold text-brand-dark tracking-tight">Formulir Kontak</h2>

                {/* Subject Selector */}
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setStep(1); // reset step
                    }}
                    className="px-4 py-2 border border-gray-250 bg-white rounded-xl text-[11px] font-extrabold text-brand-red focus:outline-none cursor-pointer shadow-2xs"
                  >
                    <option value="kemitraan">Kemitraan Franchise</option>
                    <option value="menu">Pertanyaan Menu</option>
                    <option value="katering">Pesan Katering</option>
                    <option value="saran">Kritik & Saran</option>
                  </select>
                </div>
              </div>

              {subject === "kemitraan" ? (
                /* ================= MULTI-STEP FRANCHISE FORM ================= */
                <div className="space-y-6">
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between max-w-sm mx-auto mb-8">
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${step >= 1 ? "bg-gradient-to-r from-brand-red to-[#e53935] text-white shadow-md shadow-brand-red/20 scale-105" : "bg-white/60 border border-gray-200/80 text-gray-400"}`}>
                        1
                      </span>
                      <span className="text-[10px] font-extrabold text-brand-dark hidden sm:inline uppercase tracking-wider">Profil</span>
                    </div>
                    <div className={`h-0.5 flex-grow mx-2 rounded-full transition-all duration-300 ${step >= 2 ? "bg-brand-red" : "bg-gray-200/50"}`}></div>
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${step >= 2 ? "bg-gradient-to-r from-brand-red to-[#e53935] text-white shadow-md shadow-brand-red/20 scale-105" : "bg-white/60 border border-gray-200/80 text-gray-400"}`}>
                        2
                      </span>
                      <span className="text-[10px] font-extrabold text-brand-dark hidden sm:inline uppercase tracking-wider">Lokasi</span>
                    </div>
                    <div className={`h-0.5 flex-grow mx-2 rounded-full transition-all duration-300 ${step >= 3 ? "bg-brand-red" : "bg-gray-200/50"}`}></div>
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${step >= 3 ? "bg-gradient-to-r from-brand-red to-[#e53935] text-white shadow-md shadow-brand-red/20 scale-105" : "bg-white/60 border border-gray-200/80 text-gray-400"}`}>
                        3
                      </span>
                      <span className="text-[10px] font-extrabold text-brand-dark hidden sm:inline uppercase tracking-wider">Investasi</span>
                    </div>
                  </div>

                  <form onSubmit={step < 3 ? handleNextStep : handleSubmitFranchise} className="space-y-5">
                    {/* STEP 1: PROFIL DIRI */}
                    {step === 1 && (
                      <div className="space-y-4 animate-fade-in">
                        <h3 className="font-extrabold text-xs text-brand-red uppercase tracking-wider border-b border-gray-200/50 pb-2">Langkah 1: Informasi Kontak</h3>
                        <div>
                          <label htmlFor="name" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Nama Lengkap *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap Anda..."
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Nomor HP / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Contoh: 0812XXXXXXXX"
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Alamat Email (Opsional)
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Contoh: nama@domain.com"
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: RENCANA LOKASI & USAHA */}
                    {step === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <h3 className="font-extrabold text-xs text-brand-red uppercase tracking-wider border-b border-gray-200/50 pb-2">Langkah 2: Rencana Usaha & Lokasi</h3>
                        <div>
                          <label htmlFor="city" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Rencana Kota / Kabupaten Lokasi Usaha *
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Contoh: Bandung Barat, Jakarta Selatan..."
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                          />
                        </div>
                        <div>
                          <label htmlFor="locationStatus" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Ketersediaan Lahan/Tempat Usaha
                          </label>
                          <select
                            id="locationStatus"
                            name="locationStatus"
                            value={formData.locationStatus}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                          >
                            <option value="belum_ada">Belum Ada (Sedang Mencari)</option>
                            <option value="ruko">Sudah Ada Ruko / Kios</option>
                            <option value="tanah">Sudah Ada Lahan / Halaman Kosong</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="experience" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Pengalaman Berbisnis Kuliner
                          </label>
                          <select
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                          >
                            <option value="pemula">Pemula (Belum Pernah Bisnis)</option>
                            <option value="pernah">Pernah Bisnis (Non-Kuliner)</option>
                            <option value="kuliner">Sedang/Pernah Bisnis Kuliner</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: KESIAPAN MODAL & SUBMIT */}
                    {step === 3 && (
                      <div className="space-y-4 animate-fade-in">
                        <h3 className="font-extrabold text-xs text-brand-red uppercase tracking-wider border-b border-gray-200/50 pb-2">Langkah 3: Finansial & Catatan</h3>
                        <div>
                          <label htmlFor="budget" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Alokasi Modal Investasi yang Disiapkan
                          </label>
                          <select
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                          >
                            <option value="15_25">Rp 15 Juta - Rp 25 Juta</option>
                            <option value="25_50">Rp 25 Juta - Rp 50 Juta</option>
                            <option value="50_plus">&gt; Rp 50 Juta</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="message" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                            Pesan Tambahan / Catatan Rencana Usaha
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={3}
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Jelaskan rencana lokasi rincian Anda atau hal yang ingin ditanyakan..."
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 pt-5 mt-2 border-t border-gray-200/50">
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-grow border border-gray-200 bg-white/40 hover:bg-white/85 text-gray-600 font-bold uppercase tracking-wider py-4 rounded-xl text-xs transition-all cursor-pointer text-center backdrop-blur-xs"
                        >
                          Kembali
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-grow bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-4 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer scale-100 hover:scale-[1.02]"
                      >
                        {step < 3 ? "Lanjut" : "Kirim via WhatsApp"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* ================= SIMPLIFIED STANDARD FORM (OTHER SUBJECTS) ================= */
                <form onSubmit={handleSubmitGeneral} className="space-y-5 animate-fade-in">
                  <div>
                    <label htmlFor="name" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Contoh: 0812XXXXXXXX"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[9px] font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">
                      Pesan Anda *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tuliskan pesan Anda di sini secara detail..."
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 text-brand-dark focus:bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-xs font-semibold shadow-2xs placeholder-gray-400"
                    ></textarea>
                  </div>

                  <button
                    className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-4.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer scale-100 hover:scale-[1.02]"
                  >
                    Kirim via WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ================= REGISTERED BRANCHES SECTION ================= */}
        <div className="mt-16 md:mt-24 pt-12 border-t border-gray-200/50">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-brand-red font-extrabold text-[10px] uppercase tracking-widest">Lokasi Outlet</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2.5 tracking-tight">Cabang Resmi Ayapi</h2>
            <div className="h-1.5 w-12 bg-brand-red mx-auto rounded-full mt-3 mb-4.5"></div>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
              Kunjungi cabang terdekat di kota Anda untuk merasakan cita rasa ayam krispi bakar premium kami secara langsung.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Outlet List (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {branches.map((branch, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedMapBranchIndex(index)}
                  className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover-scale-premium ${
                    selectedMapBranchIndex === index
                      ? "bg-brand-red/5 border-brand-red/20 shadow-md scale-[1.01] border-l-4 border-l-brand-red"
                      : "bg-glass border-white/40 shadow-premium hover:border-gray-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-brand-red/10 text-brand-red font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md inline-block">
                        {getBranchRegion(branch.name)}
                      </span>
                      {isBranchOpenNow(branch.open_time, branch.close_time) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          BUKA SEKARANG
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          TUTUP
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-brand-dark text-base">{branch.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed text-justify">
                      {getBranchAddress(branch.name)}
                    </p>
                    <div className="text-[11px] text-gray-400 font-semibold space-y-1 pt-1">
                      <p>🕗 {branch.open_time || "10:00"} - {branch.close_time || "22:00"} WITA</p>
                      <p>📞 {formattedWaNumber}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-brand-red/80 text-brand-red hover:bg-brand-red hover:text-white hover:border-brand-red font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all text-center cursor-pointer shadow-2xs scale-100 hover:scale-[1.01]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Buka Google Maps
                  </a>
                </div>
              ))}
            </div>

            {/* Right: Map Embed (7 Cols) */}
            <div className="lg:col-span-7 bg-glass rounded-3xl border border-white/40 shadow-premium overflow-hidden min-h-[380px] lg:min-h-full relative flex flex-col">
              <div className="p-4 bg-white/40 backdrop-blur-xs border-b border-white/30 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                  📍 Peta Lokasi: <span className="text-brand-red">{branches[selectedMapBranchIndex]?.name}</span>
                </span>
              </div>
              <div className="flex-grow w-full h-full relative min-h-[300px]">
                <iframe
                  title={`Peta Lokasi ${branches[selectedMapBranchIndex]?.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    getBranchAddress(branches[selectedMapBranchIndex]?.name || "") + " " + (branches[selectedMapBranchIndex]?.name || "")
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
