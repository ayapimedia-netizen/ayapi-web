"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or error tracking service
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] bg-background text-brand-dark px-4 text-center relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-brand-red/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-brand-yellow/5 rounded-full blur-3xl -z-10"></div>

      <div className="space-y-6 max-w-md animate-fade-in-up">
        {/* Error icon */}
        <div className="inline-block p-6 bg-brand-red/10 rounded-full text-brand-red relative animate-float">
          <span className="text-7xl">💥</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-brand-red">Terjadi Kesalahan</h1>
          <h2 className="text-xl font-extrabold text-brand-dark">Ada sedikit kendala di sistem</h2>
          <div className="h-1.5 w-16 bg-brand-yellow mx-auto rounded-full mt-3 mb-4"></div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tenang, tim kami telah menerima notifikasi ini. Silakan coba memuat ulang halaman atau kembali ke beranda.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3.5 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-6 py-3.5 border-2 border-brand-red hover:bg-brand-red hover:text-white text-brand-red font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-200"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
