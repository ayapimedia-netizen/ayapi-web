"use client";

import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const waNumber = "628213444730";

  const defaultMessage = encodeURIComponent("Halo Ayapi Krispi Bakar, saya ingin bertanya tentang menu / kemitraan.");
  const waUrl = `https://wa.me/${waNumber}?text=${defaultMessage}`;

  // Hide WhatsApp floating button on links and admin pages
  if (
    pathname === "/links" ||
    pathname === "/link" ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      aria-label="Hubungi kami di WhatsApp"
    >
      {/* Pulse effect */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping -z-10 group-hover:animate-none"></span>

      {/* WhatsApp icon */}
      <svg
        className="w-7 h-7"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.384 9.86-9.778.002-2.613-1.015-5.07-2.861-6.918C16.626 2.062 14.17 1.043 11.56 1.043c-5.443 0-9.865 4.386-9.867 9.782-.001 1.77.476 3.498 1.38 5.061L1.96 21.05l5.244-1.378zm11.385-6.85c-.3-.15-1.77-.874-2.043-.974-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.174-.175.2-.35.225-.65.075-1.205-.6-2.015-1.112-2.823-2.507-.213-.368-.213-.7-.076-.875.124-.15.275-.325.412-.49.137-.162.18-.275.273-.45.093-.188.046-.35-.022-.5-.069-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.172-.007-.369-.007-.565-.007-.196 0-.517.074-.788.374-.27.3-1.03 1.01-1.03 2.46s1.055 2.85 1.202 3.05c.148.2 2.077 3.17 5.034 4.45.703.303 1.25.485 1.678.62.707.224 1.35.193 1.86.117.567-.085 1.77-.724 2.02-1.41.25-.688.25-1.275.175-1.41-.075-.137-.275-.212-.575-.362z" />
      </svg>

      {/* Hover tooltip */}
      <span className="absolute right-16 bg-gray-900 text-white text-xs font-semibold py-1.5 px-3 rounded shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300">
        Tanya Kami di WhatsApp
      </span>
    </a>
  );
}
