"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loginAdmin } from "@/app/actions";

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCapsLockCheck = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(e.getModifierState("CapsLock"));
  };

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAdmin(formData);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMsg(result.error || "Login gagal.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen -mt-24 sm:-mt-28 bg-white p-3 sm:p-5 flex items-center justify-center relative overflow-hidden">
      <div className="w-full min-h-[calc(100vh-2.5rem)] bg-[#F7F7F9] rounded-[28px] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Soft Ayapi ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#D32F2F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[440px] w-full bg-white rounded-[28px] p-7 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-100/80 relative z-10">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E53935] via-[#C62828] to-[#8B0000] p-2 flex items-center justify-center shadow-lg shadow-[#C62828]/25">
                <Image
                  src="/logo.png"
                  alt="Ayapi Logo"
                  width={64}
                  height={36}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">
                ayapi<span className="text-[#D32F2F]">.</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-[11px] font-bold tracking-wide mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] animate-pulse" />
              Admin Workspace
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1.5 max-w-xs leading-relaxed">
              Masuk untuk mengelola katalog menu, cabang, prospek kemitraan, dan konten Ayapi.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-center gap-3 text-[#C62828] text-xs font-semibold">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-4 h-4 text-[#D32F2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-2">
                Username Admin
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  autoFocus
                  autoComplete="username"
                  onChange={() => setErrorMsg("")}
                  placeholder="Masukkan username..."
                  className="w-full pl-11 pr-4 py-3.5 bg-[#F7F7F9] border border-transparent focus:bg-white focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700">
                  Password
                </label>
                {capsLockActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                    ⚠️ Caps Lock Aktif
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  onKeyUp={handleCapsLockCheck}
                  onKeyDown={handleCapsLockCheck}
                  onChange={() => setErrorMsg("")}
                  placeholder="Masukkan password..."
                  className="w-full pl-11 pr-11 py-3.5 bg-[#F7F7F9] border border-transparent focus:bg-white focus:border-[#D32F2F] focus:ring-4 focus:ring-[#D32F2F]/10 rounded-2xl text-xs font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#D32F2F] transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#E53935] to-[#B71C1C] hover:from-[#D32F2F] hover:to-[#8B0000] text-white font-bold py-3.5 rounded-full text-xs transition-all shadow-md shadow-[#C62828]/25 hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memverifikasi Sesi...
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-7 pt-5 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#D32F2F] font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Website Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
