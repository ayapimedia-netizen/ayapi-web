import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ayapikrispibar.com"),
  title: "Ayapi Krispi Bakar | Ayam Krispi Bakar Kualitas Premium",
  description:
    "Ayapi Krispi Bakar menyajikan ayam krispi bakar kualitas premium yang renyah di luar dan juicy di dalam. Nikmati ayam bakar krispi lezat atau bergabung sebagai mitra franchise kami.",
  keywords: "Ayapi, Krispi Bakar, Ayam Krispi Bakar, Ayam Bakar, Kuliner Indonesia, Franchise Ayam, Kemitraan Ayam",
  authors: [{ name: "Ayapi Krispi Bakar" }],
  openGraph: {
    title: "Ayapi Krispi Bakar | Ayam Krispi Bakar Kualitas Premium",
    description:
      "Ayapi Krispi Bakar menyajikan ayam krispi bakar kualitas premium yang renyah di luar dan juicy di dalam. Nikmati ayam bakar krispi lezat atau bergabung sebagai mitra franchise kami.",
    url: "https://ayapikrispibar.com",
    siteName: "Ayapi Krispi Bakar",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Ayapi Krispi Bakar Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayapi Krispi Bakar | Ayam Krispi Bakar Kualitas Premium",
    description:
      "Ayapi Krispi Bakar menyajikan ayam krispi bakar kualitas premium yang renyah di luar dan juicy di dalam.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": "Ayapi Krispi Bakar Indonesia",
    "image": "https://ayapi-link.vercel.app/logo.png",
    "description": "Ayapi Krispi Bakar menyajikan ayam krispi bakar kualitas premium yang renyah di luar dan juicy di dalam. Nikmati ayam bakar krispi lezat atau bergabung sebagai mitra franchise kami.",
    "url": "https://ayapi-link.vercel.app",
    "telephone": "+628213444730",
    "priceRange": "Rp 20.000 - Rp 50.000",
    "servesCuisine": "Indonesian",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Diponegoro No.177, Dauh Puri Klod, Kec. Denpasar Bar.",
      "addressLocality": "Kota Denpasar",
      "addressRegion": "Bali",
      "postalCode": "80113",
      "addressCountry": "ID"
    }
  };

  return (
    <html lang="id" className={`${plusJakarta.variable} h-full w-full max-w-full overflow-x-hidden scroll-smooth`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://vhoijuysgyuywvpdcirz.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vhoijuysgyuywvpdcirz.supabase.co" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-background text-foreground antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-grow w-full max-w-full overflow-x-hidden pt-24 sm:pt-28">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}

