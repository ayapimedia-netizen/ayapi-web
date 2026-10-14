"use server";

import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";
import { getSecureSessionToken, getSecureSessionTokenWithTimestamp } from "@/lib/auth-helper";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";

// Define Types
export type PartnershipLead = {
  id?: string;
  name: string;
  phone: string;
  status?: string; // "Baru" | "Dihubungi" | "Batal" | "Mitra Resmi"
  created_at?: string;
};

export type MenuItem = {
  id?: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  is_available?: boolean;
  deleted_at?: string;
};

export type Category = {
  id?: string;
  key: string;
  name: string;
  created_at?: string;
};

export type GalleryItem = {
  id?: string;
  title: string;
  image: string;
  category: string;
  deleted_at?: string;
};

export type Branch = {
  id?: string;
  name: string;
  gofood: string;
  grabfood: string;
  shopeefood: string;
  open_time?: string;
  close_time?: string;
  deleted_at?: string;
};

export type Testimonial = {
  id?: string;
  name: string;
  role: string;
  rating: number;
  review: string;
  initials: string;
  bg_gradient: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  deleted_at?: string;
};

export type OrderItem = {
  name: string;
  quantity: number;
  price: string;
};

export type Order = {
  id?: string;
  customer_name: string;
  branch_name: string;
  notes: string;
  total_price: number;
  items: OrderItem[];
  status?: string;
  created_at?: string;
};

export type SiteSettings = {
  wa_number?: string;
  wa_number_formatted?: string;
  cs_email?: string;
  headquarter_address?: string;
  instagram_url?: string;
  tiktok_url?: string;
  halal_cert_number?: string;
  haki_cert_number?: string;
  roi_cogs_percent?: string;
  [key: string]: string | undefined;
};

export type PartnershipPackage = {
  id?: string;
  package_key: string;
  name: string;
  price_text: string;
  price_value: number;
  description: string;
  badge?: string;
  image: string;
  inclusions: string[];
  sort_order?: number;
  created_at?: string;
  deleted_at?: string;
};

export type FAQItem = {
  id?: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  deleted_at?: string;
};


// Fallback Static Data in case Supabase is not connected/configured
const fallbackMenuItems: MenuItem[] = [
  // 1. Krisbar (Krispy Bakar)
  {
    id: "fb-1",
    name: "Viral Krisbar 1",
    price: "Rp 29.000",
    description: "Nasi hangat pulen + Ayam Paha Bawah/Sayap bakar bumbu khas Ayapi + Minuman segar.",
    category: "krisbar",
    image: "/menu/menu-krisbar-utama.jpg",
  },
  {
    id: "fb-2",
    name: "Viral Krisbar 2",
    price: "Rp 32.000",
    description: "Nasi hangat pulen + Ayam Paha Atas/Dada bakar bumbu karamel smoky khas Ayapi + Minuman segar.",
    category: "krisbar",
    image: "/menu/menu-krisbar-utama.jpg",
  },
  {
    id: "fb-3",
    name: "Paket Satset 1 Krisbar Single",
    price: "Rp 25.000",
    description: "Nasi hangat pulen + Ayam Paha Bawah/Sayap bakar bumbu khas Ayapi + Es Teh manis segar.",
    category: "krisbar",
    image: "/menu/menu-fc1-drumstick.jpg",
  },
  {
    id: "fb-4",
    name: "Paket Satset 2 Krisbar Single",
    price: "Rp 27.000",
    description: "Nasi hangat pulen + Ayam Paha Atas/Dada bakar bumbu khas Ayapi + Es Teh manis segar.",
    category: "krisbar",
    image: "/menu/menu-fc2-dada.jpg",
  },
  {
    id: "fb-5",
    name: "Paket Satset Krisbar Double",
    price: "Rp 39.000",
    description: "Nasi hangat + 1 Paha Bawah/Sayap + 1 Paha Atas/Dada + Minuman + 1 varian sambal porsi double.",
    category: "krisbar",
    image: "/menu/menu-krisbar-lava.jpg",
  },

  // 2. Satset Krispy
  {
    id: "fb-6",
    name: "Paket Satset Krispy Single 1",
    price: "Rp 18.000",
    description: "Nasi hangat pulen + 1 potong ayam krispi renyah bumbu marinasi gurih khas Ayapi.",
    category: "krispy",
    image: "/menu/menu-viral-sayap.jpg",
  },
  {
    id: "fb-7",
    name: "Paket Satset Krispy Single 2",
    price: "Rp 25.000",
    description: "Nasi hangat pulen + 1 potong ayam krispi paha atas/dada renyah juicy keemasan.",
    category: "krispy",
    image: "/menu/menu-fc2-dada.jpg",
  },
  {
    id: "fb-8",
    name: "Paket Satset Krispy Double",
    price: "Rp 27.000",
    description: "2 potong ayam krispi renyah gurih berselimut bumbu krispi spesial.",
    category: "krispy",
    image: "/menu/menu-kulit-crispy.jpg",
  },

  // 3. Paket Geprek
  {
    id: "fb-9",
    name: "Paket Kenyang Geprek",
    price: "Rp 20.000",
    description: "Nasi hangat + Ayam krispi gurih digeprek dengan sambal cabai rawit pedas mantap.",
    category: "geprek",
    image: "/menu/menu-viral-geprek.jpg",
  },
  {
    id: "fb-10",
    name: "Paket Kenyang Jumbo Geprek",
    price: "Rp 25.000",
    description: "Nasi hangat + Ayam krispi porsi jumbo digeprek pedas nampol.",
    category: "geprek",
    image: "/menu/menu-viral-geprek.jpg",
  },
  {
    id: "fb-11",
    name: "Paket Satset Geprek Singel 1 (+ Minuman)",
    price: "Rp 25.000",
    description: "Nasi hangat + Ayam geprek renyah pedas + Minuman segar pelepas dahaga.",
    category: "geprek",
    image: "/menu/menu-fc1-drumstick.jpg",
  },
  {
    id: "fb-12",
    name: "Paket Satset Geprek Singel 2 (+ Minuman)",
    price: "Rp 27.000",
    description: "Nasi hangat + Ayam geprek paha atas/dada juicy renyah + Minuman segar.",
    category: "geprek",
    image: "/menu/menu-fc2-dada.jpg",
  },
  {
    id: "fb-13",
    name: "Paket Satset Geprek Double (+ Minuman)",
    price: "Rp 39.000",
    description: "Nasi hangat + 2 potong ayam geprek pedas gurih + Minuman segar.",
    category: "geprek",
    image: "/menu/menu-viral-geprek.jpg",
  },
  {
    id: "fb-14",
    name: "Mie Geprek Jumbo Ayam Krispy",
    price: "Rp 25.000",
    description: "Mie goreng kenyal lezat disajikan dengan ayam krispi geprek sambal rawit spesial.",
    category: "geprek",
    image: "/menu/menu-mie-geprek.jpg",
  },
  {
    id: "fb-15",
    name: "Paket Sapi Geprek",
    price: "Rp 50.000",
    description: "Nasi hangat + Daging sapi empuk berbumbu rempah digeprek dengan sambal pedas nampol.",
    category: "geprek",
    image: "/menu/menu-sapi-geprek.jpg",
  },

  // 4. Paket Rame-Rame & Utuh
  {
    id: "fb-16",
    name: "Paket Patungan (Ayam Utuh Krisbar)",
    price: "Rp 139.000",
    description: "1 Ekor Ayam Utuh Krispy Bakar + 3 Nasi putih + 2 Varian Sambal + 2 Minuman.",
    category: "patungan",
    image: "/menu/menu-paket-patungan.jpg",
  },
  {
    id: "fb-17",
    name: "Paket Gilak Crispy",
    price: "Rp 100.000",
    description: "3 Ayam Paha Bawah/Sayap + 2 Ayam Paha Atas/Dada + 4 Nasi putih + 2 Minuman.",
    category: "patungan",
    image: "/menu/menu-paket-gilak.jpg",
  },
  {
    id: "fb-18",
    name: "Paket Gilak Geprek",
    price: "Rp 112.000",
    description: "3 Ayam Paha Bawah/Sayap + 2 Ayam Paha Atas/Dada + 2 Varian Sambal + 4 Nasi putih + 2 Minuman.",
    category: "patungan",
    image: "/menu/menu-paket-gilak.jpg",
  },
  {
    id: "fb-19",
    name: "Paket Gilak Krisbar",
    price: "Rp 117.000",
    description: "3 Ayam Paha Bawah/Sayap + 2 Ayam Paha Atas/Dada Krisbar + 2 Varian Sambal + 4 Nasi putih + 2 Minuman.",
    category: "patungan",
    image: "/menu/menu-paket-patungan.jpg",
  },
  {
    id: "fb-20",
    name: "Ayam Utuh Krispy",
    price: "Rp 99.000",
    description: "1 Ekor Ayam Utuh goreng krispi renyah keemasan + 2 Varian Sambal pilihan.",
    category: "patungan",
    image: "/menu/menu-ayam-utuh.jpg",
  },
  {
    id: "fb-21",
    name: "Ayam Utuh Krisbar",
    price: "Rp 115.000",
    description: "1 Ekor Ayam Utuh krispi dibakar bumbu karamel khas Ayapi + 2 Varian Sambal pilihan.",
    category: "patungan",
    image: "/menu/menu-ayam-utuh.jpg",
  },

  // 5. Minuman
  {
    id: "fb-22",
    name: "Es Teh Manis",
    price: "Rp 5.000",
    description: "Teh melati seduh dingin segar manis pas. (Ganti varian minuman +Rp 3.000)",
    category: "minuman",
    image: "/menu/menu-es-teh.jpg",
  },
  {
    id: "fb-23",
    name: "Matcha Latte",
    price: "Rp 8.000",
    description: "Perpaduan matcha jepang creamy dingin menyegarkan.",
    category: "minuman",
    image: "/menu/menu-matcha.jpg",
  },
  {
    id: "fb-24",
    name: "Pink Lava",
    price: "Rp 8.000",
    description: "Minuman rasa kelapa sirup manis lembut creamy merah muda yang segar.",
    category: "minuman",
    image: "/menu/menu-pink-lava.jpg",
  },
  {
    id: "fb-25",
    name: "Orange Squash",
    price: "Rp 8.000",
    description: "Kesegaran jeruk berpadu soda dingin manis segar pelepas dahaga.",
    category: "minuman",
    image: "/menu/menu-orange-squash.jpg",
  },
  {
    id: "fb-26",
    name: "Coca-Cola / Sprite",
    price: "Rp 8.000",
    description: "Minuman soda dingin berkarbonasi yang menyegarkan di setiap tegukan.",
    category: "minuman",
    image: "/menu/menu-softdrink.jpg",
  },
  {
    id: "fb-27",
    name: "Milo Dingin",
    price: "Rp 8.000",
    description: "Minuman cokelat malt lezat manis gurih berenergi disajikan dingin.",
    category: "minuman",
    image: "/menu/menu-milo.jpg",
  },

  // 6. Sambal
  {
    id: "fb-28",
    name: "Pilihan Sambal Nusantara",
    price: "Rp 5.000",
    description: "Pilihan varian: Sambal Rendang, Sambal Matah, Sambal Hijau, Sambal Tempong, Sambal Geprek, Korean Spicy Saos.",
    category: "sambal",
    image: "/menu/menu-sambal-nusantara.jpg",
  },
];

const fallbackGalleryItems: GalleryItem[] = [
  {
    id: "gb-1",
    title: "Proses Pembakaran Ayam",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80",
    category: "Dapur",
  },
  {
    id: "gb-2",
    title: "Kerenyahan Khas Ayapi",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    category: "Menu",
  },
  {
    id: "gb-3",
    title: "Bahan Rempah Segar Pilihan",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    category: "Bahan Baku",
  },
  {
    id: "gb-4",
    title: "Paket Krisbar Madu Lengkap",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    category: "Menu",
  },
  {
    id: "gb-5",
    title: "Ayam Bakar Madu Smoky",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    category: "Menu",
  },
  {
    id: "gb-6",
    title: "Pelanggan Setia Ayapi",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    category: "Outlet",
  },
];

// Helper: Check if a string is a valid PostgreSQL UUID
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

// Helper: Check if Supabase project URL is default placeholder
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return url && !url.includes("your-project") && key && !key.includes("your-anon-key");
}

/* =========================================================================
   1. ADMIN AUTHENTICATION ACTIONS
   ========================================================================= */

// In-memory rate limiting for login attempts
interface LoginAttemptRecord {
  count: number;
  lockedUntil: number;
}
const loginAttemptsMap = new Map<string, LoginAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function loginAdmin(formData: FormData) {
  const usernameInput = (formData.get("username") as string || "").trim();
  const passwordInput = (formData.get("password") as string || "");

  // Basic length & type validation
  if (!usernameInput || !passwordInput || usernameInput.length > 100 || passwordInput.length > 200) {
    return { success: false, error: "Input username atau password tidak valid." };
  }

  // Enforce rate limiting key (based on username target)
  const rateLimitKey = `login_${usernameInput.toLowerCase()}`;
  const now = Date.now();
  const record = loginAttemptsMap.get(rateLimitKey);

  if (record && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
    logger.auth("DENIED", `Login rate limit exceeded for '${usernameInput}'. Locked for ${remainingMinutes} more minutes.`);
    return {
      success: false,
      error: `Terlalu banyak percobaan gagal. Akun dikunci sementara selama ${remainingMinutes} menit demi keamanan.`,
    };
  }

  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "m1n66A61lAA";

  if (usernameInput === adminUser && passwordInput === adminPass) {
    // Reset rate limiter on successful authentication
    loginAttemptsMap.delete(rateLimitKey);

    const cookieStore = await cookies();
    const timestamp = Date.now();
    const hash = getSecureSessionTokenWithTimestamp(timestamp);
    const token = `${hash}:${timestamp}`;
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      sameSite: "lax",
    });
    logger.auth("LOGIN", `Admin user '${usernameInput}' logged in successfully`);
    return { success: true };
  }

  // Increment failed attempts
  const currentAttempts = (record && record.lockedUntil <= now ? 0 : record?.count || 0) + 1;
  const isLocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
  loginAttemptsMap.set(rateLimitKey, {
    count: currentAttempts,
    lockedUntil: isLocked ? now + LOCKOUT_DURATION_MS : 0,
  });

  logger.auth("DENIED", `Failed login attempt (${currentAttempts}/${MAX_FAILED_ATTEMPTS}) for username '${usernameInput}'`);

  // Delay 1.5s to throttle timing attacks
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (isLocked) {
    return {
      success: false,
      error: `Terlalu banyak percobaan gagal. Akun dikunci sementara selama 15 menit demi keamanan.`,
    };
  }

  return {
    success: false,
    error: `Username atau password salah! (${MAX_FAILED_ATTEMPTS - currentAttempts} percobaan tersisa)`
  };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  logger.auth("LOGOUT", "Admin session terminated");
  return { success: true };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) return false;

  const parts = session.value.split(":");
  if (parts.length !== 2) return false;

  const [hash, timestampStr] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Verify expiration (24h)
  const now = Date.now();
  if (now - timestamp > 24 * 60 * 60 * 1000) {
    return false;
  }

  const expectedHash = getSecureSessionTokenWithTimestamp(timestamp);
  return hash === expectedHash;
}

// Lazy garbage collection for soft deleted items
export async function purgeExpiredDeletedItems() {
  if (!isSupabaseConfigured()) return;

  // 2 minutes retention
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

  try {
    // 1. Menu items
    const { data: menus } = await supabaseAdmin
      .from("menu_items")
      .select("id, image")
      .lt("deleted_at", twoMinutesAgo);
    if (menus && menus.length > 0) {
      for (const m of menus) {
        if (m.image) await deleteStorageFile(m.image);
      }
      await supabaseAdmin.from("menu_items").delete().in("id", menus.map(i => i.id));
    }

    // 2. Gallery items
    const { data: gallery } = await supabaseAdmin
      .from("gallery_items")
      .select("id, image")
      .lt("deleted_at", twoMinutesAgo);
    if (gallery && gallery.length > 0) {
      for (const g of gallery) {
        if (g.image) await deleteStorageFile(g.image);
      }
      await supabaseAdmin.from("gallery_items").delete().in("id", gallery.map(i => i.id));
    }

    // 3. Hero slides
    const { data: slides } = await supabaseAdmin
      .from("hero_slides")
      .select("id, image")
      .lt("deleted_at", twoMinutesAgo);
    if (slides && slides.length > 0) {
      for (const s of slides) {
        if (s.image) await deleteStorageFile(s.image);
      }
      await supabaseAdmin.from("hero_slides").delete().in("id", slides.map(i => i.id));
    }

    // 4. Branches
    await supabaseAdmin.from("branches").delete().lt("deleted_at", twoMinutesAgo);

    // 5. Links
    await supabaseAdmin.from("links").delete().lt("deleted_at", twoMinutesAgo);

    // 6. Testimonials
    await supabaseAdmin.from("testimonials").delete().lt("deleted_at", twoMinutesAgo);
  } catch (err) {
    console.error("Gagal membersihkan item kedaluwarsa:", err);
  }
}

// Helper: Delete file from Supabase Storage bucket
async function deleteStorageFile(imageUrl: string) {
  if (imageUrl.includes("ayapi-media")) {
    try {
      const fileName = imageUrl.split("/").pop()?.split("?")[0];
      if (fileName) {
        const { error } = await supabaseAdmin.storage
          .from("ayapi-media")
          .remove([fileName]);
        if (error) {
          console.warn("Gagal menghapus file dari storage:", error.message);
        } else {
          console.log("Berhasil menghapus file dari storage:", fileName);
        }
      }
    } catch (err) {
      console.warn("Gagal mengurai URL gambar untuk penghapusan storage:", err);
    }
  }
}

/* =========================================================================
   2. MENU ITEMS CRUD ACTIONS
   ========================================================================= */

export async function getMenuItems(): Promise<MenuItem[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured. Using fallback menu items.");
    return fallbackMenuItems;
  }

  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching menu items from Supabase:", err);
    return fallbackMenuItems;
  }
}

export async function addMenuItem(item: Omit<MenuItem, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Please set environment variables.");
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error("Error inserting menu item:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/");
  return data;
}

export async function updateMenuItem(id: string, item: Omit<MenuItem, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Please set environment variables.");
  }

  // Fetch the old item first to get its image URL
  const { data: oldItem } = await supabaseAdmin
    .from("menu_items")
    .select("image")
    .eq("id", id)
    .single();

  if (oldItem && oldItem.image && oldItem.image !== item.image) {
    await deleteStorageFile(oldItem.image);
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update(item)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/");
  return data;
}

export async function deleteMenuItem(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Please set environment variables.");
  }

  // Soft delete: update deleted_at
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error soft deleting menu item:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/");
  return { success: true, data };
}

export async function restoreMenuItem(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring menu item:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/");
  return data;
}

/* =========================================================================
   3. GALLERY ITEMS CRUD ACTIONS
   ========================================================================= */

export async function getGalleryItems(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured. Using fallback gallery items.");
    return fallbackGalleryItems;
  }

  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching gallery items from Supabase:", err);
    return fallbackGalleryItems;
  }
}

export async function addGalleryItem(item: Omit<GalleryItem, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Please set environment variables.");
  }

  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error("Error inserting gallery item:", error);
    throw error;
  }

  revalidatePath("/gallery");
  return data;
}

export async function updateGalleryItem(id: string, item: Omit<GalleryItem, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Please set environment variables.");
  }

  // Fetch the old item first to get its image URL
  const { data: oldItem } = await supabaseAdmin
    .from("gallery_items")
    .select("image")
    .eq("id", id)
    .single();

  if (oldItem && oldItem.image && oldItem.image !== item.image) {
    await deleteStorageFile(oldItem.image);
  }

  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .update(item)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating gallery item:", error);
    throw error;
  }

  revalidatePath("/gallery");
  return data;
}

export async function deleteGalleryItem(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Please set environment variables.");
  }

  // Soft delete: update deleted_at
  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error soft deleting gallery item:", error);
    throw error;
  }

  revalidatePath("/gallery");
  return { success: true, data };
}

export async function restoreGalleryItem(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring gallery item:", error);
    throw error;
  }

  revalidatePath("/gallery");
  return data;
}

/* =========================================================================
   4. IMAGE UPLOAD ACTION (SUPABASE STORAGE WITH LOCAL FALLBACK)
   ========================================================================= */

export async function uploadImage(formData: FormData): Promise<{ url: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  // Server-side size verification (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran berkas melebihi batas maksimal 5MB.");
  }

  // Server-side MIME type verification
  if (!file.type.startsWith("image/")) {
    throw new Error("Format berkas tidak didukung! Hanya gambar yang diperbolehkan.");
  }

  // Server-side extension verification
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    throw new Error("Ekstensi berkas tidak valid! Hanya JPG, JPEG, PNG, WEBP, GIF, dan SVG yang diperbolehkan.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  // Strategy A: Upload to Supabase Storage if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from("ayapi-media")
        .upload(safeFileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        logger.warn("STORAGE", `Supabase Storage upload failed (${error.message}), switching to local storage.`);
      } else if (data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("ayapi-media")
          .getPublicUrl(safeFileName);

        if (publicUrlData?.publicUrl) {
          logger.storage("UPLOAD", safeFileName, "Supabase Storage ayapi-media");
          return { url: publicUrlData.publicUrl };
        }
      }
    } catch (err) {
      logger.warn("STORAGE", "Error uploading to Supabase Storage, switching to local storage.", err);
    }
  }

  // Strategy B: Fallback to local file upload (/public/uploads)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, buffer);

    logger.storage("FALLBACK", safeFileName, "Saved locally at /public/uploads");
    return { url: `/uploads/${safeFileName}` };
  } catch (err) {
    logger.error("STORAGE", "Failed to upload image locally", err);
    throw new Error("Gagal mengunggah gambar ke cloud maupun lokal.");
  }
}

/* =========================================================================
   5. BRANCH / OUTLET MANAGEMENT ACTIONS
   ========================================================================= */

const fallbackBranches: Branch[] = [
  {
    name: "Ayapi Tukad Pakerisan, Denpasar",
    gofood: "https://gofood.link/a/PABFrjm",
    grabfood: "https://r.grab.com/g/6-20260811_211556_6092d3ee154e43e3a28b3a2c4b3e3706_MEXMPS-6-C7BBCVAYJP5VAE",
    shopeefood: "https://shopee.co.id/universal-link/now-food/shop/21754203?deep_and_deferred=1&shareChannel=copy_link",
    open_time: "10:00",
    close_time: "01:00",
  },
  {
    name: "Ayapi Taman Griya, Jimbaran",
    gofood: "https://gofood.link/a/yM9cRsq",
    grabfood: "https://r.grab.com/g/6-20260811_211615_6092d3ee154e43e3a28b3a2c4b3e3706_MEXMPS-6-C2TFSCJJCUXKNE",
    shopeefood: "https://shopee.co.id/universal-link/now-food/shop/1145704?deep_and_deferred=1&shareChannel=copy_link",
    open_time: "00:00",
    close_time: "23:59",
  },
];

export async function getBranches(): Promise<Branch[]> {
  if (!isSupabaseConfigured()) {
    return fallbackBranches;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("branches")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching branches from Supabase:", err);
    return fallbackBranches;
  }
}

export async function addBranch(branch: Omit<Branch, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("branches")
    .insert([branch])
    .select()
    .single();

  if (error) {
    console.error("Error inserting branch:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
  revalidatePath("/links");
  return data;
}

export async function updateBranch(id: string, branch: Omit<Branch, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("branches")
    .update(branch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating branch:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
  revalidatePath("/links");
  return data;
}

export async function deleteBranch(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  // Soft delete: update deleted_at
  const { data, error } = await supabaseAdmin
    .from("branches")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error soft deleting branch:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
  revalidatePath("/links");
  return { success: true, data };
}

export async function restoreBranch(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("branches")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring branch:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
  revalidatePath("/links");
  return data;
}

export async function deleteBranches(ids: string[]) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabaseAdmin
    .from("branches")
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    console.error("Error soft deleting branches:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
  revalidatePath("/links");
  return { success: true };
}


/* =========================================================================
   6. PARTNERSHIP LEADS MANAGEMENT ACTIONS
   ========================================================================= */

export async function getPartnershipLeads(): Promise<PartnershipLead[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("partnership_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching partnership leads from Supabase:", err);
    return [];
  }
}

export async function addPartnershipLead(lead: Omit<PartnershipLead, "id" | "status" | "created_at">) {
  // Input validation & sanitization
  const cleanName = (lead.name || "").trim().replace(/<[^>]*>?/gm, "").substring(0, 100);
  const cleanPhone = (lead.phone || "").trim().replace(/[^0-9+\s\-()]/g, "").substring(0, 30);

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Nama wajib diisi minimal 2 karakter." };
  }

  const numericDigits = cleanPhone.replace(/\D/g, "");
  if (!numericDigits || numericDigits.length < 8 || numericDigits.length > 15) {
    return { success: false, error: "Nomor WhatsApp tidak valid (minimal 8 digit)." };
  }

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured. Lead not saved.");
    return { success: false, error: "Database belum terkonfigurasi." };
  }

  const { data, error } = await supabaseAdmin
    .from("partnership_leads")
    .insert([
      {
        name: cleanName,
        phone: cleanPhone,
        status: "Baru", // Always enforce "Baru" to prevent status tampering
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error inserting partnership lead:", error);
    throw error;
  }

  revalidatePath("/admin");
  return { success: true, data };
}

export async function updatePartnershipLeadStatus(id: string, status: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("partnership_leads")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating partnership lead status:", error);
    throw error;
  }

  revalidatePath("/admin");
  return data;
}

export async function deletePartnershipLeads(ids: string[]) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabaseAdmin
    .from("partnership_leads")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error deleting partnership leads:", error);
    throw error;
  }

  revalidatePath("/admin");
  return { success: true };
}

/* =========================================================================
   7. CATEGORY MANAGEMENT ACTIONS
   ========================================================================= */

const fallbackCategories: Category[] = [
  { key: "krisbar", name: "Krispy Bakar (Kirbar)" },
  { key: "krispy", name: "Satset Krispy" },
  { key: "geprek", name: "Paket Geprek" },
  { key: "patungan", name: "Paket Rame-Rame & Utuh" },
  { key: "minuman", name: "Aneka Minuman" },
  { key: "sambal", name: "Pilihan Sambal" },
];

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return fallbackCategories;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching categories from Supabase:", err);
    return fallbackCategories;
  }
}

export async function addCategory(category: Omit<Category, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert([
      {
        key: category.key,
        name: category.name,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding category:", error);
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/menu");
  return data;
}

export async function updateCategory(id: string, category: Omit<Category, "id">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update({
      key: category.key,
      name: category.name,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/menu");
  return data;
}

export async function deleteCategory(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/menu");
  return { success: true };
}

/* =========================================================================
   8. ORDER LOGGING ACTIONS
   ========================================================================= */

export async function createOrder(order: Omit<Order, "id" | "status" | "created_at">): Promise<Order> {
  if (!isSupabaseConfigured()) {
    // Mock response when DB not connected
    return {
      ...order,
      id: "mock-" + Math.random().toString(36).substr(2, 9),
      status: "Confirmed",
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([
      {
        customer_name: order.customer_name,
        branch_name: order.branch_name,
        notes: order.notes,
        total_price: order.total_price,
        items: order.items,
        status: "Confirmed",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating order in Supabase:", error);
    throw error;
  }

  revalidatePath("/admin");
  return data;
}

export async function getOrders(): Promise<Order[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching orders from Supabase:", err);
    return [];
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }

  revalidatePath("/admin");
  return data;
}

export async function deleteOrders(ids: string[]): Promise<{ success: boolean }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error deleting orders:", error);
    throw error;
  }

  revalidatePath("/admin");
  return { success: true };
}

/* =========================================================================
   9. QUICK MENU ITEM AVAILABILITY ACTION
   ========================================================================= */

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error toggling menu item availability:", error);
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/menu");
  revalidatePath("/");
  return data;
}

/* =========================================================================
   10. LINK-IN-BIO (WEB AYAPI LINK) ACTIONS
   ========================================================================= */

export type LinkItem = {
  id?: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  is_active?: boolean;
  sort_order: number;
  clicks?: number;
  created_at?: string;
};

const fallbackLinks = (waNumber: string): LinkItem[] => [
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "WhatsApp Pemesanan",
    subtitle: "Pesan Ayam Krispi Bakar online langsung ke outlet kami",
    url: `https://wa.me/${waNumber}?text=Halo%20Ayapi%20Krispi%20Bakar%2C%20saya%20ingin%20memesan%20menu%20lezat%20Anda.`,
    icon: "WhatsApp",
    is_active: true,
    sort_order: 1,
    clicks: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "Kemitraan Franchise",
    subtitle: "Informasi bisnis & waralaba outlet Ayapi Krispi Bakar",
    url: `https://wa.me/${waNumber}?text=Halo%20Ayapi%20Krispi%20Bakar%2C%20saya%20tertarik%20dengan%20kemitraan%20outlet.`,
    icon: "Briefcase",
    is_active: true,
    sort_order: 2,
    clicks: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    title: "Website Utama Ayapi",
    subtitle: "Lihat menu lengkap, galeri, dan profil kami",
    url: "/",
    icon: "Globe",
    is_active: true,
    sort_order: 3,
    clicks: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    title: "Instagram Resmi",
    subtitle: "Ikuti promo menarik & update kuliner di Instagram kami",
    url: "https://instagram.com/ayapikrispi.id",
    icon: "Instagram",
    is_active: true,
    sort_order: 4,
    clicks: 0,
  },
];

export async function getLinks(): Promise<LinkItem[]> {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628213444730";
  if (!isSupabaseConfigured()) {
    return fallbackLinks(wa);
  }
  try {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return fallbackLinks(wa);
    }
    return data;
  } catch (err) {
    console.error("Error fetching links from Supabase:", err);
    return fallbackLinks(wa);
  }
}

export async function getAdminLinks(): Promise<LinkItem[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  // Lazy purge expired items
  await purgeExpiredDeletedItems();

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "628213444730";
  if (!isSupabaseConfigured()) {
    return fallbackLinks(wa);
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("links")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      return fallbackLinks(wa);
    }
    return data;
  } catch (err) {
    console.error("Error fetching admin links from Supabase:", err);
    return fallbackLinks(wa);
  }
}

export async function addLink(link: Omit<LinkItem, "id" | "clicks" | "created_at" | "sort_order">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data: maxItem } = await supabaseAdmin
    .from("links")
    .select("sort_order")
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = maxItem && maxItem.length > 0 ? maxItem[0].sort_order + 1 : 1;

  const { data, error } = await supabaseAdmin
    .from("links")
    .insert([{ ...link, sort_order: nextOrder, clicks: 0 }])
    .select()
    .single();

  if (error) {
    console.error("Error adding link:", error);
    throw error;
  }

  revalidatePath("/links");
  revalidatePath("/admin");
  return data;
}

export async function updateLink(id: string, link: Partial<Omit<LinkItem, "id" | "clicks" | "created_at">>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    return { id, ...link };
  }

  if (isValidUuid(id)) {
    const { data, error } = await supabaseAdmin
      .from("links")
      .update(link)
      .eq("id", id)
      .select();

    if (!error && data && data.length > 0) {
      revalidatePath("/links");
      revalidatePath("/admin");
      return data[0];
    }
  }

  // If link didn't exist in Supabase (e.g. fallback item), insert it into DB
  const { data: maxItem } = await supabaseAdmin
    .from("links")
    .select("sort_order")
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = maxItem && maxItem.length > 0 ? maxItem[0].sort_order + 1 : 1;

  const { data: newData, error: insertErr } = await supabaseAdmin
    .from("links")
    .insert([{
      title: link.title || "Tautan",
      subtitle: link.subtitle || "",
      url: link.url || "/",
      icon: link.icon || "Globe",
      is_active: link.is_active !== undefined ? link.is_active : true,
      sort_order: nextOrder,
      clicks: 0,
    }])
    .select()
    .single();

  if (insertErr) {
    console.error("Error inserting fallback link to DB:", insertErr);
    throw insertErr;
  }

  revalidatePath("/links");
  revalidatePath("/admin");
  return newData;
}

export async function deleteLink(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured() || !isValidUuid(id)) {
    return { success: true };
  }

  // Soft delete: update deleted_at
  const { data, error } = await supabaseAdmin
    .from("links")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error soft deleting link:", error);
    throw error;
  }

  revalidatePath("/links");
  revalidatePath("/admin");
  return { success: true, data: data?.[0] };
}

export async function restoreLink(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured() || !isValidUuid(id)) {
    return { success: true };
  }

  const { data, error } = await supabaseAdmin
    .from("links")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring link:", error);
    throw error;
  }

  revalidatePath("/links");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function swapLinkOrder(id1: string, order1: number, id2: string, order2: number) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error: err1 } = await supabaseAdmin
    .from("links")
    .update({ sort_order: order2 })
    .eq("id", id1);

  if (err1) throw err1;

  const { error: err2 } = await supabaseAdmin
    .from("links")
    .update({ sort_order: order1 })
    .eq("id", id2);

  if (err2) throw err2;

  revalidatePath("/links");
  revalidatePath("/admin");
  return { success: true };
}

export async function incrementLinkClicks(id: string) {
  if (!isSupabaseConfigured() || !isValidUuid(id)) return { success: true };

  try {
    const { data: linkItem, error: fetchErr } = await supabaseAdmin
      .from("links")
      .select("clicks")
      .eq("id", id)
      .single();

    if (fetchErr || !linkItem) return { success: false, error: fetchErr?.message };

    const nextClicks = (linkItem.clicks || 0) + 1;
    const { error: updateErr } = await supabaseAdmin
      .from("links")
      .update({ clicks: nextClicks })
      .eq("id", id);

    if (updateErr) throw updateErr;

    return { success: true };
  } catch (err) {
    console.error("Error incrementing click count:", err);
    return { success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function getThemeSetting(): Promise<string> {
  if (!isSupabaseConfigured()) {
    return "peach";
  }
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "theme")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      await supabaseAdmin
        .from("settings")
        .insert([{ key: "theme", value: "peach" }]);
      return "peach";
    }
    return data?.value || "peach";
  } catch (err) {
    console.error("Error fetching theme setting from Supabase:", err);
    return "peach";
  }
}

export async function updateThemeSetting(theme: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "theme", value: theme })
    .select()
    .single();

  if (error) {
    console.error("Error updating theme setting:", error);
    throw error;
  }

  revalidatePath("/links");
  revalidatePath("/admin");
  return data;
}

// ============================================================
// HERO SLIDES ACTIONS (Slideshow di Halaman Utama)
// ============================================================

export type HeroSlide = {
  id?: string;
  image: string;
  alt: string;
  badge?: string;
  title?: string;
  sub: string;
  button_text?: string;
  button_link?: string;
  button2_text?: string;
  button2_link?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
};

const fallbackHeroSlides: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
    alt: "Ayam Krispi Bakar Juicy",
    badge: "🔥 KULINER FRANCHISE TERBAIK",
    title: "Aroma Smoky Juara,\nBisnis Kuliner Luar Biasa",
    sub: "Sensasi Ayam Krispi Bakar (Krisbar) premium yang renyah di luar, juicy di dalam. Menarik ribuan pelanggan harian, menghadirkan peluang investasi franchise dengan keuntungan cepat dan berkelanjutan.",
    button_text: "🍔 Lihat Menu Terlezat",
    button_link: "/menu",
    button2_text: "💼 Peluang Kemitraan",
    button2_link: "/kemitraan",
    sort_order: 0,
    is_active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    alt: "Ayam Geprek Krisbar Pedas",
    badge: "🔥 MENU TERLARIS NYAMAN DI KANTONG",
    title: "Krispi Bakar Geprek,\nPedas Nampol Nikmat!",
    sub: "Kombinasi ayam krispi bakar saus pilihan digeprek dengan sambal korek bawang asli yang dibuat segar setiap hari. Lezatnya bikin ketagihan!",
    button_text: "🍔 Lihat Menu Terlezat",
    button_link: "/menu",
    button2_text: "💼 Peluang Kemitraan",
    button2_link: "/kemitraan",
    sort_order: 1,
    is_active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    alt: "Outlet Kemitraan Premium Ayapi",
    badge: "🔥 PELUANG EMAS FRANCHISE",
    title: "Gabung Kemitraan,\nModal Ringan Cepat Balik",
    sub: "Sistem bisnis auto-pilot yang transparan, bumbu rahasia tersuplai aman, pendampingan penuh dari tim berpengalaman. Raih omset puluhan juta per bulan!",
    button_text: "💼 Gabung Mitra Sekarang",
    button_link: "/kemitraan",
    button2_text: "📞 Hubungi Kami",
    button2_link: "/kontak",
    sort_order: 2,
    is_active: true,
  },
];

// Public: fetch active slides sorted by sort_order
export async function getHeroSlides(): Promise<HeroSlide[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching hero slides from Supabase:", err);
    return [];
  }
}

// Admin: fetch ALL slides (including inactive) sorted by sort_order
export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  // Lazy purge expired items
  await purgeExpiredDeletedItems();

  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from("hero_slides")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching admin hero slides from Supabase:", err);
    return [];
  }
}

export async function addHeroSlide(slide: Omit<HeroSlide, "id" | "created_at">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("hero_slides")
    .insert([slide])
    .select()
    .single();

  if (error) {
    console.error("Error adding hero slide:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return data;
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("hero_slides")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating hero slide:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return data;
}

export async function deleteHeroSlide(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  // Soft delete: update deleted_at
  const { data, error } = await supabaseAdmin
    .from("hero_slides")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error soft deleting hero slide:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function restoreHeroSlide(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("hero_slides")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring hero slide:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return data;
}

export async function swapHeroSlideOrder(id1: string, order1: number, id2: string, order2: number) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const [res1, res2] = await Promise.all([
    supabaseAdmin.from("hero_slides").update({ sort_order: order2 }).eq("id", id1),
    supabaseAdmin.from("hero_slides").update({ sort_order: order1 }).eq("id", id2),
  ]);

  if (res1.error || res2.error) {
    console.error("Error swapping hero slide order:", res1.error || res2.error);
    throw res1.error || res2.error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

/* =========================================================================
   11. TESTIMONIALS CRUD ACTIONS
   ========================================================================= */

const fallbackTestimonials: Testimonial[] = [
  {
    name: "Indra Kurniawan",
    role: "Mitra Franchise - Bandung",
    rating: 5,
    review: "Keputusan terbaik saya tahun lalu adalah bergabung menjadi mitra Ayapi. Modal awalnya sangat terjangkau, bumbu disuplai terpusat jadi rasa selalu konsisten. Kurang dari 5 bulan outlet saya sudah balik modal!",
    initials: "IK",
    bg_gradient: "from-red-500 to-orange-500",
    sort_order: 1,
    is_active: true,
  },
  {
    name: "Siti Rahma",
    role: "Pelanggan Setia - Depok",
    rating: 5,
    review: "Ayam krispi bakar di sini bener-bener beda! Kulit luarnya garing renyah tapi dagingnya tetap juicy banget. Ditambah saus bakar madunya yang meresap sampai ke dalam daging. Langganan keluarga kami!",
    initials: "SR",
    bg_gradient: "from-amber-500 to-yellow-500",
    sort_order: 2,
    is_active: true,
  },
  {
    name: "Rian Hidayat",
    role: "Pecinta Kuliner - Jakarta",
    rating: 5,
    review: "Paket Geprek Krisbar Ijonya juara banget! Pedas cabai ijonya segar gurih, rasa smoky ayam bakarnya dapet, dan porsinya bikin kenyang. Pesan lewat keranjang belanja web ini juga gampang banget, langsung masuk WA!",
    initials: "RH",
    bg_gradient: "from-rose-500 to-red-600",
    sort_order: 3,
    is_active: true,
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) {
    return fallbackTestimonials;
  }
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    return fallbackTestimonials;
  }
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  // Lazy purge expired items
  await purgeExpiredDeletedItems();

  if (!isSupabaseConfigured()) {
    return fallbackTestimonials;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("testimonials")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching admin testimonials:", err);
    return fallbackTestimonials;
  }
}

export async function addTestimonial(testimonial: Omit<Testimonial, "id" | "created_at" | "sort_order">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data: maxItem } = await supabaseAdmin
    .from("testimonials")
    .select("sort_order")
    .is("deleted_at", null)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = maxItem && maxItem.length > 0 ? maxItem[0].sort_order + 1 : 1;

  const { data, error } = await supabaseAdmin
    .from("testimonials")
    .insert([{ ...testimonial, sort_order: nextOrder }])
    .select()
    .single();

  if (error) {
    console.error("Error adding testimonial:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return data;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("testimonials")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating testimonial:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return data;
}

export async function deleteTestimonial(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  // Soft delete: update deleted_at
  const { data, error } = await supabaseAdmin
    .from("testimonials")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error soft deleting testimonial:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function restoreTestimonial(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("testimonials")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring testimonial:", error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return data;
}

export async function swapTestimonialOrder(id1: string, order1: number, id2: string, order2: number) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const [res1, res2] = await Promise.all([
    supabaseAdmin.from("testimonials").update({ sort_order: order2 }).eq("id", id1),
    supabaseAdmin.from("testimonials").update({ sort_order: order1 }).eq("id", id2),
  ]);

  if (res1.error || res2.error) {
    console.error("Error swapping testimonial order:", res1.error || res2.error);
    throw res1.error || res2.error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

// =========================================================================
// SITE SETTINGS ACTIONS
// =========================================================================

const fallbackSettings: Record<string, string> = {
  wa_number: "628213444730",
  wa_number_formatted: "+62 821-3444-730",
  cs_email: "ayapihr@gmail.com",
  headquarter_address: "Jl. Tukad Pakerisan No.96, Dauh Puri Klod, Kec. Denpasar Barat, Kota Denpasar, Bali",
  instagram_url: "https://instagram.com/ayapikrispibar",
  tiktok_url: "https://tiktok.com/@ayapikrispibar",
  halal_cert_number: "ID3111000012345",
  haki_cert_number: "IPT2024001234",
  roi_cogs_percent: "55",
};

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured()) {
    return fallbackSettings;
  }
  try {
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;
    if (!data || data.length === 0) return fallbackSettings;

    const result: Record<string, string> = { ...fallbackSettings };
    data.forEach((item: { key: string; value: string }) => {
      result[item.key] = item.value;
    });
    return result;
  } catch (err) {
    console.error("Error fetching site settings from Supabase:", err);
    return fallbackSettings;
  }
}

export async function updateAllSiteSettings(settings: Record<string, string>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value: value ?? "",
  }));

  const { data, error } = await supabaseAdmin
    .from("settings")
    .upsert(rows)
    .select();

  if (error) {
    console.error("Error updating site settings:", error);
    throw new Error(error.message || "Gagal memperbarui pengaturan website.");
  }

  revalidatePath("/");
  revalidatePath("/kemitraan");
  revalidatePath("/kontak");
  revalidatePath("/admin");
  return data;
}

// =========================================================================
// PARTNERSHIP PACKAGES ACTIONS
// =========================================================================

const fallbackPackages: PartnershipPackage[] = [
  {
    id: "pkg-1",
    package_key: "express-1",
    name: "Paket Express 1",
    price_text: "15 Juta*",
    price_value: 15000000,
    description: "Lebih Ringkas, Tetap Menarik! Dimensi Rombong: 120 x 80 x 200 cm. Konsep praktis, hemat tempat, cocok untuk pemula dan lokasi padat lalu lintas.",
    badge: "Budget Friendly",
    image: "/packages/booth-express-1.jpg",
    inclusions: [
      "Rombong Express Ringkas (120 x 80 x 200 cm)",
      "Peralatan Masak & Penggorengan Lengkap",
      "Starter Kit Bahan Baku Awal (Ayam & Bumbu)",
      "Media Promosi Fisik (Banner & Menu)",
      "SOP Penyajian & Pelatihan Karyawan",
      "Terdaftar di Platform Pesan Antar Online",
    ],
    sort_order: 1,
  },
  {
    id: "pkg-2",
    package_key: "express-2",
    name: "Paket Express 2",
    price_text: "28 Juta*",
    price_value: 28000000,
    description: "Rombong Lebih Luas, Tampilan Lebih Maksimal! Dimensi Rombong: 125 x 60 x 200 cm. Kapasitas display etalase lebih luas untuk omzet harian lebih tinggi.",
    badge: "Best Value!",
    image: "/packages/booth-express-2.jpg",
    inclusions: [
      "Rombong Express Luas (125 x 60 x 200 cm)",
      "Peralatan Lengkap & Display Etalase Luas",
      "Starter Kit Bahan Baku Skala Menengah",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Support Promosi & Integrasi Ojol Delivery",
    ],
    sort_order: 2,
  },
  {
    id: "pkg-3",
    package_key: "resto-2",
    name: "Paket Mini Resto",
    price_text: "135 Juta*",
    price_value: 135000000,
    description: "Resto modern & lebih luas. Ukuran: 5 x 7 METER. Menampung lebih banyak pelanggan dengan atmosfer modern dan operasional yang efisien.",
    badge: "Mini Resto",
    image: "/packages/resto-outlet-2.jpg",
    inclusions: [
      "Layout Outlet Modern & Luas (5 x 7 M)",
      "Peralatan Dapur Komersial Stainless Steel",
      "Kapasitas Dine-in Nyaman & Estetik",
      "Starter Kit Bahan Baku Skala Besar",
      "Sistem POS Kasir, Tablet, & SOP Lengkap",
      "Support Grand Opening & Marketing Sosmed",
    ],
    sort_order: 3,
  },
  {
    id: "pkg-4",
    package_key: "resto-3",
    name: "Paket Resto",
    price_text: "180 Juta*",
    price_value: 180000000,
    description: "Resto premium & full experience. Ukuran: 6 x 8 METER. Konsep flagship resto dengan kapasitas maksimal, interior mewah, dan pengalaman kuliner terlengkap.",
    badge: "Flagship Resto",
    image: "/packages/resto-outlet-3.jpg",
    inclusions: [
      "Desain Interior & Renovasi Full Experience (6 x 8 M)",
      "Peralatan Dapur Premium Kapasitas Maksimal",
      "Kapasitas Dine-in Luas & Nyaman (30+ Kursi)",
      "Paket Bahan Baku Terlengkap",
      "Pendampingan Grand Opening Tim Pusat",
      "Kampanye Marketing & Influencer Launching",
    ],
    sort_order: 4,
  },
];

export async function getPartnershipPackages(): Promise<PartnershipPackage[]> {
  if (!isSupabaseConfigured()) {
    return fallbackPackages;
  }
  try {
    const { data, error } = await supabase
      .from("partnership_packages")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackPackages;
    }
    return data;
  } catch (err) {
    console.error("Error fetching partnership packages from Supabase:", err);
    return fallbackPackages;
  }
}

export async function getAdminPartnershipPackages(): Promise<PartnershipPackage[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    return fallbackPackages;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("partnership_packages")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return fallbackPackages;
    return data;
  } catch (err) {
    console.error("Error fetching admin partnership packages:", err);
    return fallbackPackages;
  }
}

export async function addPartnershipPackage(pkg: PartnershipPackage) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const payload = {
    ...pkg,
    badge: pkg.badge ?? "",
  };

  const { data, error } = await supabaseAdmin
    .from("partnership_packages")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error adding partnership package:", error);
    throw new Error(error.message || "Gagal menambahkan paket kemitraan ke Supabase.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return data;
}

export async function updatePartnershipPackage(id: string, pkg: Partial<PartnershipPackage>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const payload = { ...pkg };
  if (payload.badge === undefined) delete payload.badge;

  const { data, error } = await supabaseAdmin
    .from("partnership_packages")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating partnership package:", error);
    throw new Error(error.message || "Gagal memperbarui paket kemitraan.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return data;
}

export async function deletePartnershipPackage(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("partnership_packages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting partnership package:", error);
    throw new Error(error.message || "Gagal menghapus paket kemitraan.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function restorePartnershipPackage(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("partnership_packages")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring partnership package:", error);
    throw new Error(error.message || "Gagal memulihkan paket kemitraan.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return data;
}

// =========================================================================
// FAQS ACTIONS
// =========================================================================

const fallbackFaqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Apakah bumbu rahasia disediakan oleh pusat?",
    answer: "Ya, semua bumbu rahasia marinasi ayam dan saus bakar disuplai dari pusat dalam bentuk kemasan praktis untuk menjaga konsistensi cita rasa khas Ayapi di semua cabang.",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "faq-2",
    question: "Berapa lama estimasi waktu dari tanda tangan kontrak hingga outlet buka?",
    answer: "Proses lengkap rata-rata memakan waktu 2 hingga 4 minggu, meliputi survei lokasi, pengiriman booth, pelatihan SOP karyawan, hingga persiapan Grand Opening.",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "faq-3",
    question: "Apakah ada royalti fee bulanan?",
    answer: "Tidak. Ayapi menggunakan sistem kemitraan tanpa bagi hasil bulanan (0% royalty fee). Semua keuntungan bersih yang diperoleh dari outlet sepenuhnya milik mitra.",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "faq-4",
    question: "Bagaimana dengan pencarian lokasi dan karyawan?",
    answer: "Pencarian lokasi dan karyawan dilakukan oleh mitra. Namun, tim analis kami akan melakukan survei kelayakan lokasi secara mendalam dan menyediakan materi pelatihan lengkap untuk karyawan Anda.",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "faq-5",
    question: "Apakah boleh menjual menu di luar menu resmi Ayapi?",
    answer: "Demi menjaga standardisasi brand dan kualitas rasa, mitra dilarang keras menjual menu makanan berat di luar menu resmi yang dikeluarkan oleh pusat Ayapi.",
    sort_order: 5,
    is_active: true,
  },
];

export async function getFaqs(): Promise<FAQItem[]> {
  if (!isSupabaseConfigured()) {
    return fallbackFaqs;
  }
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackFaqs;
    }
    return data;
  } catch (err) {
    console.error("Error fetching FAQs from Supabase:", err);
    return fallbackFaqs;
  }
}

export async function getAdminFaqs(): Promise<FAQItem[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    return fallbackFaqs;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return fallbackFaqs;
    return data;
  } catch (err) {
    console.error("Error fetching admin FAQs:", err);
    return fallbackFaqs;
  }
}


export async function addFaq(faq: FAQItem) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .insert([faq])
    .select()
    .single();

  if (error) {
    console.error("Error adding FAQ:", error);
    throw new Error(error.message || "Gagal menambahkan FAQ ke Supabase.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return data;
}

export async function updateFaq(id: string, faq: Partial<FAQItem>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .update(faq)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating FAQ:", error);
    throw new Error(error.message || "Gagal memperbarui FAQ.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return data;
}

export async function deleteFaq(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error deleting FAQ:", error);
    throw new Error(error.message || "Gagal menghapus FAQ.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function restoreFaq(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error restoring FAQ:", error);
    throw new Error(error.message || "Gagal memulihkan FAQ.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return data;
}

export async function swapFaqOrder(id1: string, order1: number, id2: string, order2: number) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const [res1, res2] = await Promise.all([
    supabaseAdmin.from("faqs").update({ sort_order: order2 }).eq("id", id1),
    supabaseAdmin.from("faqs").update({ sort_order: order1 }).eq("id", id2),
  ]);

  const swapErr = res1.error || res2.error;
  if (swapErr) {
    console.error("Error swapping FAQ order:", swapErr);
    throw new Error(swapErr.message || "Gagal mengubah urutan FAQ.");
  }

  revalidatePath("/kemitraan");
  revalidatePath("/admin");
  return { success: true };
}

/* =========================================================================
   12. TRASH BIN (KERANJANG SAMPAH) ACTIONS
   ========================================================================= */

export type TrashItem = {
  id: string;
  type: "menu" | "gallery" | "branch" | "link" | "slideshow" | "testimonial" | "package" | "faq";
  title: string;
  subtitle?: string;
  image?: string;
  deleted_at: string;
};

export async function getTrashItems(): Promise<TrashItem[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) return [];
  if (!isSupabaseConfigured()) return [];

  const trash: TrashItem[] = [];

  try {
    const [
      { data: menus },
      { data: gallery },
      { data: branches },
      { data: links },
      { data: slides },
      { data: testimonials },
    ] = await Promise.all([
      supabaseAdmin.from("menu_items").select("id, name, category, image, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("gallery_items").select("id, title, category, image, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("branches").select("id, name, city, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("links").select("id, title, url, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("hero_slides").select("id, title, alt, image, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("testimonials").select("id, name, role, deleted_at").not("deleted_at", "is", null),
    ]);

    if (menus) {
      menus.forEach((m) => trash.push({ id: m.id, type: "menu", title: m.name, subtitle: `Menu (${m.category})`, image: m.image, deleted_at: m.deleted_at }));
    }
    if (gallery) {
      gallery.forEach((g) => trash.push({ id: g.id, type: "gallery", title: g.title, subtitle: `Galeri (${g.category})`, image: g.image, deleted_at: g.deleted_at }));
    }
    if (branches) {
      branches.forEach((b) => trash.push({ id: b.id, type: "branch", title: b.name, subtitle: `Cabang ${b.city}`, deleted_at: b.deleted_at }));
    }
    if (links) {
      links.forEach((l) => trash.push({ id: l.id, type: "link", title: l.title, subtitle: l.url, deleted_at: l.deleted_at }));
    }
    if (slides) {
      slides.forEach((s) => trash.push({ id: s.id, type: "slideshow", title: s.title || s.alt, subtitle: "Hero Slideshow", image: s.image, deleted_at: s.deleted_at }));
    }
    if (testimonials) {
      testimonials.forEach((t) => trash.push({ id: t.id, type: "testimonial", title: t.name, subtitle: `Testimoni (${t.role})`, deleted_at: t.deleted_at }));
    }

    trash.sort((a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime());
    return trash;
  } catch (err) {
    console.error("Error fetching trash items:", err);
    return [];
  }
}

export async function permanentDeleteTrashItem(id: string, type: TrashItem["type"]) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  if (!isSupabaseConfigured() || !isValidUuid(id)) return { success: true };

  const tableMap: Record<TrashItem["type"], string> = {
    menu: "menu_items",
    gallery: "gallery_items",
    branch: "branches",
    link: "links",
    slideshow: "hero_slides",
    testimonial: "testimonials",
    package: "partnership_packages",
    faq: "faqs",
  };

  const tableName = tableMap[type];
  if (!tableName) return { success: false };

  if (type === "menu" || type === "gallery" || type === "slideshow") {
    const { data: item } = await supabaseAdmin.from(tableName).select("image").eq("id", id).single();
    if (item?.image) await deleteStorageFile(item.image);
  }

  const { error } = await supabaseAdmin.from(tableName).delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  return { success: true };
}

export async function restoreTrashItem(id: string, type: TrashItem["type"]) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  if (!isSupabaseConfigured() || !isValidUuid(id)) return { success: true };

  const tableMap: Record<TrashItem["type"], string> = {
    menu: "menu_items",
    gallery: "gallery_items",
    branch: "branches",
    link: "links",
    slideshow: "hero_slides",
    testimonial: "testimonials",
    package: "partnership_packages",
    faq: "faqs",
  };

  const tableName = tableMap[type];
  if (!tableName) return { success: false };

  const { error } = await supabaseAdmin.from(tableName).update({ deleted_at: null }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  return { success: true };
}

export async function emptyAllTrashItems() {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  if (!isSupabaseConfigured()) return { success: true };

  try {
    const trashItems = await getTrashItems();
    for (const item of trashItems) {
      await permanentDeleteTrashItem(item.id, item.type);
    }
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error emptying trash:", err);
    throw err;
  }
}


