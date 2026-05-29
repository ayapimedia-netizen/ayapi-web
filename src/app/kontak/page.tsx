"use client";

import React, { useState, useEffect } from "react";
import { getBranches, Branch, addPartnershipLead } from "@/app/actions";

export default function Kontak() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6287777652032";
  const formattedWaNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_FORMATTED || "+62 877-7765-2032";

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
    const fetchBranches = async () => {
      try {
        const branchList = await getBranches();
        if (branchList && branchList.length > 0) {
          setBranches(branchList);
        }
      } catch (err) {
        console.error("Gagal memuat cabang:", err);
      }
    };
    fetchBranches();
  }, []);

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
    <div className="w-full bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-brand-red font-bold text-xs uppercase tracking-widest px-4 py-1.5 bg-brand-red/10 rounded-full inline-block mb-3">
            Hubungi Tim Kami
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-4">
            Kontak Kami
          </h1>
          <div className="h-1.5 w-16 bg-brand-red mx-auto rounded-full mb-4"></div>
          <p className="text-gray-500 text-sm md:text-base">
            Ada pertanyaan tentang menu, pemesanan katering, atau tertarik mendaftar kemitraan franchise? Hubungi kami langsung.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">

          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-8 bg-gray-50 p-8 rounded-3xl border border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-brand-dark mb-4">Informasi Kontak</h2>
              <p className="text-gray-500 text-xs leading-relaxed">
                Silakan hubungi kami melalui salah satu saluran berikut, atau kirimkan formulir untuk terhubung langsung via WhatsApp.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-brand-red/5 rounded-xl text-brand-red shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark text-xs">Alamat Kantor Pusat</h3>
                  <p className="text-gray-500 text-xs mt-1">Jl. Mawar Indah No. 12, Jakarta Selatan, Indonesia</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-brand-red/5 rounded-xl text-brand-red shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark text-xs">Nomor Telepon / WA</h3>
                  <p className="text-gray-500 text-xs mt-1">{formattedWaNumber}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-brand-red/5 rounded-xl text-brand-red shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark text-xs">Alamat Email</h3>
                  <p className="text-gray-500 text-xs mt-1">info@ayapikrispibar.com</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold uppercase tracking-wider py-3.5 rounded-xl text-xs transition-all duration-200 shadow-sm"
              >
                Chat WhatsApp CS
              </a>
            </div>
          </div>

          {/* Right: Interactive Forms */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-dark">Formulir Kontak</h2>

              {/* Subject Selector */}
              <div className="relative">
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setStep(1); // reset step
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-bold text-brand-red bg-white focus:outline-none cursor-pointer"
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
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-brand-red text-white" : "bg-gray-100 text-gray-400"}`}>
                      1
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 hidden sm:inline uppercase">Profil</span>
                  </div>
                  <div className={`h-0.5 flex-grow mx-2 bg-gray-200 ${step >= 2 ? "bg-brand-red" : ""}`}></div>
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-brand-red text-white" : "bg-gray-100 text-gray-400"}`}>
                      2
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 hidden sm:inline uppercase">Lokasi</span>
                  </div>
                  <div className={`h-0.5 flex-grow mx-2 bg-gray-200 ${step >= 3 ? "bg-brand-red" : ""}`}></div>
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? "bg-brand-red text-white" : "bg-gray-100 text-gray-400"}`}>
                      3
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 hidden sm:inline uppercase">Investasi</span>
                  </div>
                </div>

                <form onSubmit={step < 3 ? handleNextStep : handleSubmitFranchise} className="space-y-5">
                  {/* STEP 1: PROFIL DIRI */}
                  {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <h3 className="font-bold text-sm text-brand-dark border-b border-gray-100 pb-2">Langkah 1: Informasi Kontak</h3>
                      <div>
                        <label htmlFor="name" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                          Alamat Email (Opsional)
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Contoh: nama@domain.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: RENCANA LOKASI & USAHA */}
                  {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <h3 className="font-bold text-sm text-brand-dark border-b border-gray-100 pb-2">Langkah 2: Rencana Usaha & Lokasi</h3>
                      <div>
                        <label htmlFor="city" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="locationStatus" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                          Ketersediaan Lahan/Tempat Usaha
                        </label>
                        <select
                          id="locationStatus"
                          name="locationStatus"
                          value={formData.locationStatus}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all cursor-pointer"
                        >
                          <option value="belum_ada">Belum Ada (Sedang Mencari)</option>
                          <option value="ruko">Sudah Ada Ruko / Kios</option>
                          <option value="tanah">Sudah Ada Lahan / Halaman Kosong</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="experience" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                          Pengalaman Berbisnis Kuliner
                        </label>
                        <select
                          id="experience"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all cursor-pointer"
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
                      <h3 className="font-bold text-sm text-brand-dark border-b border-gray-100 pb-2">Langkah 3: Finansial & Catatan</h3>
                      <div>
                        <label htmlFor="budget" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                          Alokasi Modal Investasi yang Disiapkan
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all cursor-pointer"
                        >
                          <option value="15_25">Rp 15 Juta - Rp 25 Juta</option>
                          <option value="25_50">Rp 25 Juta - Rp 50 Juta</option>
                          <option value="50_plus">&gt; Rp 50 Juta</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                          Pesan Tambahan / Catatan Rencana Usaha
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={3}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Jelaskan rencana lokasi rincian Anda atau hal yang ingin ditanyakan..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        ></textarea>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-500 font-bold uppercase tracking-wider py-3.5 rounded-xl text-xs transition-all cursor-pointer text-center"
                      >
                        Kembali
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
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
                  <label htmlFor="name" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                    Nomor HP / WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Contoh: 0812XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                  ></textarea>
                </div>

                <button
                  className="w-full bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-widest py-4 rounded-xl text-xs transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                >
                  Kirim via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>


        {/* ================= REGISTERED BRANCHES SECTION ================= */}
        <div className="mt-16 md:mt-24 pt-12 border-t border-gray-100">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-brand-red font-bold text-xs uppercase tracking-wider">Lokasi Outlet</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Cabang Resmi Ayapi</h2>
            <div className="h-1.5 w-12 bg-brand-red mx-auto rounded-full mt-3 mb-4"></div>
            <p className="text-gray-500 text-xs md:text-sm">
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
                  className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                    selectedMapBranchIndex === index
                      ? "bg-brand-red/5 border-brand-red/40 shadow-sm scale-[1.01]"
                      : "bg-white border-gray-100 shadow-xs hover:border-gray-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-brand-red/10 text-brand-red font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md inline-block">
                        {getBranchRegion(branch.name)}
                      </span>
                      {selectedMapBranchIndex === index && (
                        <span className="text-brand-red font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse inline-block"></span>
                          Peta Aktif
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-brand-dark text-base">{branch.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {getBranchAddress(branch.name)}
                    </p>
                    <div className="text-xs text-gray-400 font-semibold space-y-1">
                      <p>🕗 10:00 - 22:00 WIB</p>
                      <p>📞 {formattedWaNumber}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full flex items-center justify-center gap-2 border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-bold uppercase tracking-wider py-3 rounded-xl text-xs transition-all text-center cursor-pointer"
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
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[350px] lg:min-h-full relative flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
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
