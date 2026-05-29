import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] bg-background text-brand-dark px-4 text-center relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-brand-red/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-brand-yellow/5 rounded-full blur-3xl -z-10"></div>

      <div className="space-y-6 max-w-md animate-fade-in-up">
        {/* Big error icon with flame emoji */}
        <div className="inline-block p-6 bg-brand-red/10 rounded-full text-brand-red relative animate-float">
          <span className="text-7xl">🔥</span>
          <span className="absolute bottom-1 right-1 text-2xl bg-white p-1 rounded-full shadow-md border border-gray-100 select-none">🚫</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-brand-red">404</h1>
          <h2 className="text-2xl font-extrabold text-brand-dark">Halaman Tidak Ditemukan</h2>
          <div className="h-1.5 w-16 bg-brand-yellow mx-auto rounded-full mt-3 mb-4"></div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Oops! Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau sedang dipanggang hingga terlalu gosong.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3.5 bg-brand-red hover:bg-[#a01c1c] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/menu"
            className="px-6 py-3.5 border-2 border-brand-red hover:bg-brand-red hover:text-white text-brand-red font-bold uppercase tracking-wider text-xs rounded-xl transition-all duration-200"
          >
            Lihat Menu Ayapi
          </Link>
        </div>
      </div>
    </div>
  );
}
