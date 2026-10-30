export const dynamic = "force-dynamic";

import { getMenuItems, getBranches, getHeroSlides, getPromos, MenuItem, Branch, HeroSlide } from "@/app/actions";
import { defaultPromoItems, PromoItem } from "@/lib/promo-defaults";
import HomeClient from "@/components/HomeClient";

// Fallback slides when database is empty (exact 5 slides requested)
const defaultHeroSlides: HeroSlide[] = [
  {
    image: "/hero/slide-1-happy.jpg",
    alt: "Ayapi Bikin Happy",
    badge: "🎉 SEKALI COBA SUSAH BERHENTI",
    title: "Ayapi Bikin Happy.\nSekali Coba Susah Berhenti!",
    sub: "Ayam Krispi Bakar yang renyah diluar, juicy di dalam, dengan rasa yang bikin makan jadi lebih happy!",
    button_text: "🍔 Pesan Menu Sekarang",
    button_link: "/menu",
    button2_text: "📍 Lokasi Outlet",
    button2_link: "/#cabang",
    sort_order: 1,
    is_active: true,
  },
  {
    image: "/hero/slide-2-mitra.jpg",
    alt: "Gabung Kemitraan Ayapi",
    badge: "💼 PELUANG BISNIS KULINER",
    title: "Gabung Kemitraan Ayapi\nFleksibel, Dibantu dari A-Z",
    sub: "Mulai dari persiapan outlet, operasional hingga pendampingan bisnis. Bahkan jika kamu tidak punya banyak waktu untuk pengelolaan outlet, Ayapi memiliki system management untuk membantu menjalankannya.",
    button_text: "💼 Pelajari Kemitraan",
    button_link: "/kemitraan",
    button2_text: "📞 Konsultasi Tim Ahli",
    button2_link: "/kontak",
    sort_order: 2,
    is_active: true,
  },
  {
    image: "/hero/slide-3-krisbar.jpg",
    alt: "Ayam Krispi Bakar Smoky",
    badge: "🔥 PELOPOR AYAM KRISPI BAKAR",
    title: "Ayam Krispi Bakar\nKrispi di Luar, Juicy di Dalam",
    sub: "Bukan dengan sekedar ayam krispi. Perpaduan tekstur renyah, ayam juicy, dan aroma bakaran yang menjadi ciri khas Ayapi.",
    button_text: "🍔 Lihat Daftar Menu",
    button_link: "/menu",
    button2_text: "💼 Info Kemitraan",
    button2_link: "/kemitraan",
    sort_order: 3,
    is_active: true,
  },
  {
    image: "/hero/slide-4-locations.jpg",
    alt: "Ayapi Ada di Dekat Kamu",
    badge: "📍 CABANG OUTLET & ONLINE",
    title: "Ayapi Ada di Dekat Kamu 📍\nMakan Langsung atau Pesan Online",
    sub: "Temukan outlet Ayapi terdekat dan nikmati menu favoritmu. Tersedia untuk makan ditempat maupun pemesanan online.",
    button_text: "📍 Cari Outlet Terdekat",
    button_link: "/#cabang",
    button2_text: "🍔 Order Online",
    button2_link: "/menu",
    sort_order: 4,
    is_active: true,
  },
  {
    image: "/hero/slide-5-delivery.jpg",
    alt: "Lagi Mager? Free Delivery!",
    badge: "⚡ PROMO DELIVERY CEPAT",
    title: "Lagi Mager? Free Delivery!\nNikmati Tanpa Perlu Keluar Rumah",
    sub: "Pesan menu favoritmu dan nikmati Ayapi dari rumah. Cek ketersediaan promo dan area delivery melalui Whatsapp kami.",
    button_text: "🛵 Chat Delivery WhatsApp",
    button_link: "https://wa.me/628213444730?text=Halo%20Ayapi!%20Saya%20mau%20pesan%20Free%20Delivery",
    button2_text: "🍔 Lihat Menu",
    button2_link: "/menu",
    sort_order: 5,
    is_active: true,
  },
];

const fallbackFeaturedItems: MenuItem[] = [
  {
    name: "Viral Krisbar 1",
    price: "Rp 29.000",
    description: "Nasi hangat pulen + Ayam Paha Bawah/Sayap bakar bumbu khas Ayapi + Minuman segar.",
    category: "krisbar",
    image: "/menu/menu-krisbar-utama.jpg",
  },
  {
    name: "Viral Krisbar 2",
    price: "Rp 32.000",
    description: "Nasi hangat pulen + Ayam Paha Atas/Dada bakar bumbu karamel smoky khas Ayapi + Minuman segar.",
    category: "krisbar",
    image: "/menu/menu-krisbar-utama.jpg",
  },
  {
    name: "Paket Satset Krisbar Double",
    price: "Rp 39.000",
    description: "Nasi hangat + 1 Paha Bawah/Sayap + 1 Paha Atas/Dada + Minuman + 1 varian sambal porsi double.",
    category: "krisbar",
    image: "/menu/menu-krisbar-lava.jpg",
  },
];

export default async function Home() {
  const [slidesData, promosData, menuItems, branchesData] = await Promise.all([
    getHeroSlides().catch(() => []),
    getPromos().catch(() => []),
    getMenuItems().catch(() => []),
    getBranches().catch(() => []),
  ]);

  const initialHeroSlides: HeroSlide[] =
    slidesData && slidesData.length > 0 ? slidesData : defaultHeroSlides;

  const initialPromos: PromoItem[] =
    promosData && promosData.length > 0 ? promosData : defaultPromoItems;

  const initialFeaturedItems: MenuItem[] =
    menuItems && menuItems.length > 0
      ? menuItems.slice(0, 3)
      : fallbackFeaturedItems;

  const initialBranches: Branch[] = branchesData || [];

  return (
    <HomeClient
      initialHeroSlides={initialHeroSlides}
      initialPromos={initialPromos}
      initialFeaturedItems={initialFeaturedItems}
      initialBranches={initialBranches}
    />
  );
}
