"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LinkRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/links");
  }, [router]);

  return (
    <div className="w-full min-h-screen -mt-24 sm:-mt-28 bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-red/10 border-t-brand-red animate-spin"></div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Mengalihkan...</p>
      </div>
    </div>
  );
}
