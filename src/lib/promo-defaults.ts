export type PromoItem = {
  id: string;
  badge: string;
  title: string;
  desc: string;
  image: string;
  bannerImage: string;
  ctaText?: string;
  actionType: "modal" | "link";
  linkUrl?: string;
  sort_order?: number;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  details: {
    highlight: string;
    description: string;
    points: string[];
    actionButtonText?: string;
    actionButtonUrl?: string;
    showQrCode?: boolean;
  };
};

export const defaultPromoItems: PromoItem[] = [
  {
    id: "free-delivery",
    badge: "🛵 PROMO DELIVERY",
    title: "FREE DELIVERY",
    desc: "Nikmati Ayapi tanpa perlu keluar rumah",
    image: "/promos/promo-free-delivery.jpg",
    bannerImage: "/promos/promo-free-delivery.jpg",
    ctaText: "See More",
    actionType: "modal",
    sort_order: 1,
    is_active: true,
    details: {
      highlight: "Gratis Ongkir Langsung ke Pintu Rumahmu!",
      description: "Pesan menu favoritmu dan nikmati Ayapi dari rumah tanpa biaya ongkir. Cek ketersediaan promo dan area jangkauan delivery melalui WhatsApp kami.",
      points: [
        "Pesan langsung tanpa aplikasi ojol pihak ketiga",
        "Ayam tiba dalam keadaan hangat, renyah, dan fresh",
        "Tersedia untuk area delivery terdekat outlet Ayapi",
      ],
      actionButtonText: "Pesan via WhatsApp Delivery",
      actionButtonUrl: "https://wa.me/628213444730?text=Halo%20Ayapi!%20Saya%20mau%20pesan%20menu%20Free%20Delivery",
    },
  },
  {
    id: "tetangga-ayapi",
    badge: "🌴 KHUSUS KTP JIMBARAN",
    title: "TETANGGA AYAPI",
    desc: "Upgrade minuman khusus KTP Jimbaran",
    image: "/promos/promo-tetangga-ayapi.jpg",
    bannerImage: "/promos/promo-tetangga-ayapi.jpg",
    ctaText: "See More",
    actionType: "modal",
    sort_order: 2,
    is_active: true,
    details: {
      highlight: "Teman Santay Andalan Khusus Tetangga Jimbaran!",
      description: "Apresiasi kami untuk warga sekitar! Dapatkan GRATIS upgrade minuman setiap pembelian menu ayam Ayapi cukup dengan menunjukkan KTP Jimbaran Anda.",
      points: [
        "Cukup tunjukkan KTP beralamat Jimbaran saat memesan",
        "Gratis upgrade ke Teh Manis Jumbo atau varian minuman favorit",
        "Berlaku untuk Dine-in & Take Away di outlet Ayapi Jimbaran",
      ],
      actionButtonText: "Cek Lokasi Outlet Jimbaran",
      actionButtonUrl: "/#cabang",
    },
  },
  {
    id: "spesial-pelajar",
    badge: "🎓 PROMO PELAJAR & MAHASISWA",
    title: "SPESIAL UNTUK PELAJAR",
    desc: "Nasi + ayam hanya 15RB!",
    image: "/promos/promo-spesial-pelajar.jpg",
    bannerImage: "/promos/promo-spesial-pelajar.jpg",
    ctaText: "See More",
    actionType: "modal",
    sort_order: 3,
    is_active: true,
    details: {
      highlight: "Porsi Kenyang, Sambal Mantap, Cuma 15RB!",
      description: "Makan kenyang tanpa bikin kantong jebol! Paket hemat nasi pulen hangat + ayam renyah + Es Teh manis segar khusus untuk kamu para pelajar dan mahasiswa.",
      points: [
        "Paket lengkap Nasi + Ayam Gurih + Es Teh Manis",
        "Hanya Rp 15.000 (harga khusus pelajar)",
        "Tunjukkan kartu pelajar/mahasiswa atau kenakan seragam",
      ],
      actionButtonText: "Lihat Semua Menu",
      actionButtonUrl: "/menu",
    },
  },
  {
    id: "paket-ulang-tahun",
    badge: "🎂 EVENT & PARTY",
    title: "PAKET ULANG TAHUN",
    desc: "Rayakan hari istimewa Bersama kami",
    image: "/promos/promo-paket-ulang-tahun.jpg",
    bannerImage: "/promos/promo-paket-ulang-tahun.jpg",
    ctaText: "See More",
    actionType: "modal",
    sort_order: 4,
    is_active: true,
    details: {
      highlight: "Rayakan Hari Istimewa Penuh Keceriaan Bersama Ayapi!",
      description: "Bikin pesta ulang tahun makin seru dengan paket hidangan ayam krisbar, dekorasi balon meriah, dan bingkisan spesial dari Ayapi.",
      points: [
        "Paket makanan praktis dan higienis untuk teman & keluarga",
        "Bisa pesan untuk acara di outlet atau diantar langsung ke lokasi pesta",
        "Scan barcode atau klik tombol di bawah untuk konsultasi paket dengan tim kami",
      ],
      actionButtonText: "Chat WhatsApp Kemitraan & Event",
      actionButtonUrl: "https://wa.me/628213444730?text=Halo%20Tim%20Ayapi!%20Saya%20ingin%20tanya%20detail%20Paket%20Ulang%20Tahun",
      showQrCode: true,
    },
  },
  {
    id: "paket-keluarga",
    badge: "🍗 PAKET RAME-RAME",
    title: "PAKET KELUARGA & BUCKET",
    desc: "Makan kenyang bareng keluarga & teman lebih hemat",
    image: "/promos/promo-paket-keluarga.jpg",
    bannerImage: "/promos/promo-paket-keluarga.jpg",
    ctaText: "See More",
    actionType: "modal",
    sort_order: 5,
    is_active: true,
    details: {
      highlight: "Kenyang Rame-Rame, Makin Akrab Bareng Ayapi!",
      description: "Pilihan pas untuk kumpul keluarga, rekan kerja, atau nobar! Dapatkan 1 Bucket Ayam Krisbar renyah lengkap dengan porsi nasi dan es teh jumbo dengan harga spesial.",
      points: [
        "1 Bucket Isi 8 Potong Ayam Krispi Renyah Gurih",
        "Lengkap dengan 4 Nasi Putih + 4 Es Teh Manis Segar",
        "Ekstra sambal pilihan (Sambal Korek / Sambal Krisbar)",
      ],
      actionButtonText: "Pesan Paket Rame-Rame via WhatsApp",
      actionButtonUrl: "https://wa.me/628213444730?text=Halo%20Ayapi!%20Saya%20ingin%20pesan%20Paket%20Rame-Rame%20Keluarga",
    },
  },
];
