export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-background text-brand-dark px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulse ring */}
        <div className="absolute w-24 h-24 rounded-full border-4 border-brand-red/20 animate-ping"></div>
        {/* Inner spinning ring */}
        <div className="w-16 h-16 rounded-full border-4 border-t-brand-red border-brand-yellow animate-spin"></div>
        {/* Flame emoji icon in the center */}
        <div className="absolute font-black text-brand-red text-lg select-none">🔥</div>
      </div>
      <h3 className="mt-8 text-lg font-extrabold tracking-wider uppercase text-brand-dark animate-pulse">
        Memuat Halaman...
      </h3>
      <p className="mt-2 text-xs text-gray-500 font-medium">
        Menyiapkan ayam krispi bakar terbaik untuk Anda.
      </p>
    </div>
  );
}
