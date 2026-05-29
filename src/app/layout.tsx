import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  return (
    <html lang="id" className={`${geistSans.variable} h-full w-full max-w-full overflow-x-hidden scroll-smooth`} data-scroll-behavior="smooth">
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-background text-foreground antialiased font-sans">
        <Navbar />
        <main className="flex-grow w-full max-w-full overflow-x-hidden">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
