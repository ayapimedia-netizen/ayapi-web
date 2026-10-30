"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";
import {
  createAdminSessionToken,
  getCredentialFingerprint,
  hashAdminPassword,
  isSessionValid,
} from "@/lib/auth-helper";
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

import { PromoItem, defaultPromoItems } from "@/lib/promo-defaults";
export type { PromoItem };


// Fallback Static Data in case Supabase is not connected/configured
const fallbackMenuItems: MenuItem[] = [
  // 1. Krisbar (Krispy Bakar)
  {
    id: "fb-1",
    name: "Viral Krisbar 1",
    price: "Rp 29.000",
    description: "Nasi hangat pulen + Ayam Paha Bawah/Sayap bakar bumbu khas Ayapi + Minuman segar.",
    category: "krisbar",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064276715-wcbe78.webp",
  },
  {
    id: "fb-2",
    name: "Viral Krisbar 2",
    price: "Rp 32.000",
    description: "Nasi hangat pulen + Ayam Paha Atas/Dada bakar bumbu karamel smoky khas Ayapi + Minuman segar.",
    category: "krisbar",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064311856-3md2pj.webp",
  },
  {
    id: "fb-3",
    name: "Paket Satset 1 Krisbar Single",
    price: "Rp 25.000",
    description: "Nasi hangat pulen + Ayam Paha Bawah/Sayap bakar bumbu khas Ayapi + Es Teh manis segar.",
    category: "krisbar",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064541802-p08vw6.webp",
  },
  {
    id: "fb-4",
    name: "Paket Satset 2 Krisbar Single",
    price: "Rp 27.000",
    description: "Nasi hangat pulen + Ayam Paha Atas/Dada bakar bumbu khas Ayapi + Es Teh manis segar.",
    category: "krisbar",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064340055-amwp1u.webp",
  },
  {
    id: "fb-5",
    name: "Paket Satset Krisbar Double",
    price: "Rp 39.000",
    description: "Nasi hangat + 1 Paha Bawah/Sayap + 1 Paha Atas/Dada + Minuman + 1 varian sambal porsi double.",
    category: "krisbar",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064578694-vc8qta.webp",
  },

  // 2. Satset Krispy
  {
    id: "fb-6",
    name: "Paket Satset Krispy Single 1",
    price: "Rp 18.000",
    description: "Nasi hangat pulen + 1 potong ayam krispi renyah bumbu marinasi gurih khas Ayapi.",
    category: "krispy",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792062900030-xyc1yv.webp",
  },
  {
    id: "fb-7",
    name: "Paket Satset Krispy Single 2",
    price: "Rp 25.000",
    description: "Nasi hangat pulen + 1 potong ayam krispi paha atas/dada renyah juicy keemasan.",
    category: "krispy",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792063119054-bjwa3r.webp",
  },
  {
    id: "fb-8",
    name: "Paket Satset Krispy Double",
    price: "Rp 27.000",
    description: "2 potong ayam krispi renyah gurih berselimut bumbu krispi spesial.",
    category: "krispy",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792065075729-my22ws.webp",
  },

  // 3. Paket Geprek
  {
    id: "fb-9",
    name: "Paket Kenyang Geprek",
    price: "Rp 20.000",
    description: "Nasi hangat + Ayam krispi gurih digeprek dengan sambal cabai rawit pedas mantap.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064862351-92dm8p.webp",
  },
  {
    id: "fb-10",
    name: "Paket Kenyang Jumbo Geprek",
    price: "Rp 25.000",
    description: "Nasi hangat + Ayam krispi porsi jumbo digeprek pedas nampol.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792064880371-tjdsy3.webp",
  },
  {
    id: "fb-11",
    name: "Paket Satset Geprek Singel 1 (+ Minuman)",
    price: "Rp 25.000",
    description: "Nasi hangat + Ayam geprek renyah pedas + Minuman segar pelepas dahaga.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792065467418-nk1hdg.webp",
  },
  {
    id: "fb-12",
    name: "Paket Satset Geprek Singel 2 (+ Minuman)",
    price: "Rp 27.000",
    description: "Nasi hangat + Ayam geprek paha atas/dada juicy renyah + Minuman segar.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792065955058-gicfy2.webp",
  },
  {
    id: "fb-13",
    name: "Paket Satset Geprek Double (+ Minuman)",
    price: "Rp 39.000",
    description: "Nasi hangat + 2 potong ayam geprek pedas gurih + Minuman segar.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792063503838-mn7wfi.webp",
  },
  {
    id: "fb-14",
    name: "Mie Geprek Jumbo Ayam Krispy",
    price: "Rp 25.000",
    description: "Mie goreng kenyal lezat disajikan dengan ayam krispi geprek sambal rawit spesial.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792066349159-nohu7y.webp",
  },
  {
    id: "fb-15",
    name: "Paket Sapi Geprek",
    price: "Rp 50.000",
    description: "Nasi hangat + Daging sapi empuk berbumbu rempah digeprek dengan sambal pedas nampol.",
    category: "geprek",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792067446424-nmbsq9.webp",
  },

  // 4. Paket Rame-Rame & Utuh
  {
    id: "fb-16",
    name: "Paket Patungan (Ayam Utuh Krisbar)",
    price: "Rp 139.000",
    description: "1 Ekor Ayam Utuh Krispy Bakar + 3 Nasi putih + 2 Varian Sambal + 2 Minuman.",
    category: "patungan",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792066405802-kfwujj.webp",
  },
  {
    id: "fb-17",
    name: "Paket Gilak Crispy",
    price: "Rp 100.000",
    description: "3 Ayam Paha Bawah/Sayap + 2 Ayam Paha Atas/Dada + 4 Nasi putih + 2 Minuman.",
    category: "patungan",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792066234356-nk17hz.webp",
  },
  {
    id: "fb-18",
    name: "Paket Gilak Geprek",
    price: "Rp 112.000",
    description: "3 Ayam Paha Bawah/Sayap + 2 Ayam Paha Atas/Dada + 2 Varian Sambal + 4 Nasi putih + 2 Minuman.",
    category: "patungan",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792066271768-59336o.webp",
  },
  {
    id: "fb-19",
    name: "Paket Gilak Krisbar",
    price: "Rp 117.000",
    description: "3 Ayam Paha Bawah/Sayap + 2 Ayam Paha Atas/Dada Krisbar + 2 Varian Sambal + 4 Nasi putih + 2 Minuman.",
    category: "patungan",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792066293769-16mfm0.webp",
  },
  {
    id: "fb-20",
    name: "Ayam Utuh Krispy",
    price: "Rp 99.000",
    description: "1 Ekor Ayam Utuh goreng krispi renyah keemasan + 2 Varian Sambal pilihan.",
    category: "patungan",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792067494490-vxkncx.webp",
  },
  {
    id: "fb-21",
    name: "Ayam Utuh Krisbar",
    price: "Rp 115.000",
    description: "1 Ekor Ayam Utuh krispi dibakar bumbu karamel khas Ayapi + 2 Varian Sambal pilihan.",
    category: "patungan",
    image: "https://vhoijuysgyuywvpdcirz.supabase.co/storage/v1/object/public/ayapi-media/1792066917163-9xqk00.webp",
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
   1. ADMIN AUTHENTICATION & SECURITY CREDENTIALS ACTIONS
   ========================================================================= */

export type AdminSecurityInfo = {
  username: string;
  isCustomUsername: boolean;
  isCustomPassword: boolean;
  updatedAt: string | null;
};

type ActiveAdminCredentials = {
  username: string;
  passwordHash: string;
  isCustomUsername: boolean;
  isCustomPassword: boolean;
  updatedAt: string | null;
};

const getActiveAdminCredentials = cache(async (): Promise<ActiveAdminCredentials> => {
  const defaultUsername = (process.env.ADMIN_USERNAME || "admin").trim();
  const defaultPassword = process.env.ADMIN_PASSWORD || "m1n66A61lAA";
  const defaultPasswordHash = hashAdminPassword(defaultPassword);

  if (!isSupabaseConfigured()) {
    return {
      username: defaultUsername,
      passwordHash: defaultPasswordHash,
      isCustomUsername: false,
      isCustomPassword: false,
      updatedAt: null,
    };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("key, value")
      .in("key", ["__admin_username", "__admin_password_hash", "__admin_updated_at"]);

    if (error || !data || data.length === 0) {
      return {
        username: defaultUsername,
        passwordHash: defaultPasswordHash,
        isCustomUsername: false,
        isCustomPassword: false,
        updatedAt: null,
      };
    }

    const map: Record<string, string> = {};
    data.forEach((row: { key: string; value: string }) => {
      map[row.key] = row.value;
    });

    const customUser = map["__admin_username"]?.trim();
    const customPassHash = map["__admin_password_hash"]?.trim();

    return {
      username: customUser || defaultUsername,
      passwordHash: customPassHash || defaultPasswordHash,
      isCustomUsername: Boolean(customUser),
      isCustomPassword: Boolean(customPassHash),
      updatedAt: map["__admin_updated_at"] || null,
    };
  } catch (err) {
    console.error("Error fetching admin credentials from Supabase:", err);
    return {
      username: defaultUsername,
      passwordHash: defaultPasswordHash,
      isCustomUsername: false,
      isCustomPassword: false,
      updatedAt: null,
    };
  }
});

// In-memory rate limiting for login & credential change attempts
interface LoginAttemptRecord {
  count: number;
  lockedUntil: number;
}
const loginAttemptsMap = new Map<string, LoginAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function loginAdmin(formData: FormData) {
  const usernameInput = ((formData.get("username") as string) || "").trim();
  const rawPasswordInput = (formData.get("password") as string) || "";
  const trimmedPasswordInput = rawPasswordInput.trim();

  // Basic length & type validation
  if (!usernameInput || !trimmedPasswordInput || usernameInput.length > 100 || rawPasswordInput.length > 200) {
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

  const activeCreds = await getActiveAdminCredentials();
  const usernameMatches = usernameInput.toLowerCase() === activeCreds.username.toLowerCase();
  const passwordMatches =
    hashAdminPassword(rawPasswordInput) === activeCreds.passwordHash ||
    hashAdminPassword(trimmedPasswordInput) === activeCreds.passwordHash;

  if (usernameMatches && passwordMatches) {
    // Reset rate limiter on successful authentication
    loginAttemptsMap.delete(rateLimitKey);

    const cookieStore = await cookies();
    const timestamp = Date.now();
    const credFingerprint = getCredentialFingerprint(activeCreds.username, activeCreds.passwordHash);
    const token = createAdminSessionToken(timestamp, credFingerprint);

    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      sameSite: "lax",
    });
    logger.auth("LOGIN", `Admin user '${activeCreds.username}' logged in successfully`);
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
    error: `Username atau password salah! (${MAX_FAILED_ATTEMPTS - currentAttempts} percobaan tersisa)`,
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
  const sessionValue = cookieStore.get("admin_session")?.value;
  if (!isSessionValid(sessionValue)) return false;

  // If token carries a credential fingerprint (3-part token), verify it matches active credentials
  if (sessionValue && sessionValue.split(":").length === 3) {
    const activeCreds = await getActiveAdminCredentials();
    const expectedFp = getCredentialFingerprint(activeCreds.username, activeCreds.passwordHash);
    return isSessionValid(sessionValue, expectedFp);
  }

  return true;
}

export async function getAdminSecurityInfo(): Promise<AdminSecurityInfo> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  const active = await getActiveAdminCredentials();
  return {
    username: active.username,
    isCustomUsername: active.isCustomUsername,
    isCustomPassword: active.isCustomPassword,
    updatedAt: active.updatedAt,
  };
}

export async function updateAdminCredentials(payload: {
  currentPassword: string;
  newUsername?: string;
  newPassword?: string;
  confirmPassword?: string;
}): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  securityInfo?: AdminSecurityInfo;
}> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: "Sesi Anda telah berakhir. Silakan login kembali." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database Supabase belum terkonfigurasi." };
  }

  const rateLimitKey = "change_cred_admin";
  const now = Date.now();
  const record = loginAttemptsMap.get(rateLimitKey);

  if (record && record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
    return {
      success: false,
      error: `Terlalu banyak percobaan salah saat memverifikasi password lama. Fitur dikunci sementara selama ${remainingMinutes} menit.`,
    };
  }

  const rawCurrent = payload.currentPassword || "";
  const trimmedCurrent = rawCurrent.trim();
  if (!trimmedCurrent) {
    return { success: false, error: "Password saat ini wajib diisi untuk verifikasi keamanan." };
  }

  const activeCreds = await getActiveAdminCredentials();
  const isCurrentValid =
    hashAdminPassword(rawCurrent) === activeCreds.passwordHash ||
    hashAdminPassword(trimmedCurrent) === activeCreds.passwordHash;

  if (!isCurrentValid) {
    const currentAttempts = (record && record.lockedUntil <= now ? 0 : record?.count || 0) + 1;
    const isLocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
    loginAttemptsMap.set(rateLimitKey, {
      count: currentAttempts,
      lockedUntil: isLocked ? now + LOCKOUT_DURATION_MS : 0,
    });
    logger.auth("DENIED", `Failed current-password check during credential update (${currentAttempts}/${MAX_FAILED_ATTEMPTS})`);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (isLocked) {
      return {
        success: false,
        error: "Terlalu banyak percobaan gagal! Fitur ganti password dikunci selama 15 menit demi keamanan.",
      };
    }

    return {
      success: false,
      error: `Password saat ini salah! (${MAX_FAILED_ATTEMPTS - currentAttempts} percobaan tersisa)`,
    };
  }

  // Current password verified -> clear rate limit
  loginAttemptsMap.delete(rateLimitKey);

  const requestedUsername = (payload.newUsername ?? activeCreds.username).trim();
  const isUsernameChanged = requestedUsername.toLowerCase() !== activeCreds.username.toLowerCase();

  const cleanNewPassword = (payload.newPassword || "").trim();
  const cleanConfirmPassword = (payload.confirmPassword || "").trim();
  const isPasswordProvided = cleanNewPassword.length > 0 || cleanConfirmPassword.length > 0;

  if (!isUsernameChanged && !isPasswordProvided) {
    return {
      success: false,
      error: "Tidak ada perubahan yang dimasukkan. Silakan isi username baru atau password baru.",
    };
  }

  // Validate new username
  if (requestedUsername.length < 3 || requestedUsername.length > 32) {
    return {
      success: false,
      error: "Username admin harus terdiri dari 3 hingga 32 karakter.",
    };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(requestedUsername)) {
    return {
      success: false,
      error: "Username hanya boleh berisi huruf, angka, titik (.), garis bawah (_), atau strip (-) tanpa spasi.",
    };
  }

  let nextPasswordHash = activeCreds.passwordHash;

  // Validate new password if provided
  if (isPasswordProvided) {
    if (cleanNewPassword.length < 8) {
      return {
        success: false,
        error: "Password baru minimal harus terdiri dari 8 karakter.",
      };
    }
    if (cleanNewPassword.length > 100) {
      return {
        success: false,
        error: "Password baru maksimal 100 karakter.",
      };
    }
    if (!/[a-zA-Z]/.test(cleanNewPassword) || !/[0-9]/.test(cleanNewPassword)) {
      return {
        success: false,
        error: "Password baru wajib mengandung kombinasi huruf dan angka agar tidak mudah ditebak.",
      };
    }
    if (cleanNewPassword.toLowerCase() === requestedUsername.toLowerCase()) {
      return {
        success: false,
        error: "Password baru tidak boleh sama dengan username admin.",
      };
    }
    if (cleanNewPassword !== cleanConfirmPassword) {
      return {
        success: false,
        error: "Konfirmasi password baru tidak cocok! Pastikan kedua kolom password baru sama persis.",
      };
    }

    const candidateHash = hashAdminPassword(cleanNewPassword);
    if (candidateHash === activeCreds.passwordHash) {
      return {
        success: false,
        error: "Password baru tidak boleh sama persis dengan password saat ini.",
      };
    }

    nextPasswordHash = candidateHash;
  }

  const updatedAtIso = new Date().toISOString();
  const rowsToUpsert: { key: string; value: string }[] = [
    { key: "__admin_username", value: requestedUsername },
    { key: "__admin_updated_at", value: updatedAtIso },
  ];

  if (isPasswordProvided) {
    rowsToUpsert.push({ key: "__admin_password_hash", value: nextPasswordHash });
  }

  const { error: dbErr } = await supabaseAdmin.from("settings").upsert(rowsToUpsert);
  if (dbErr) {
    console.error("Error updating admin credentials in Supabase:", dbErr);
    return {
      success: false,
      error: "Gagal menyimpan kredensial baru ke database. Silakan coba lagi.",
    };
  }

  // Immediately rotate session cookie so current admin stays logged in while old sessions expire
  const cookieStore = await cookies();
  const timestamp = Date.now();
  const newFingerprint = getCredentialFingerprint(requestedUsername, nextPasswordHash);
  const newToken = createAdminSessionToken(timestamp, newFingerprint);

  cookieStore.set("admin_session", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
  });

  logger.auth(
    "SECURITY",
    `Admin credentials updated (usernameChanged=${isUsernameChanged}, passwordChanged=${isPasswordProvided})`
  );

  revalidatePath("/admin");

  return {
    success: true,
    message:
      isUsernameChanged && isPasswordProvided
        ? "Username dan Password Admin berhasil diperbarui! Sesi Anda telah disinkronkan otomatis."
        : isPasswordProvided
        ? "Password Admin berhasil diperbarui! Sesi Anda telah disinkronkan otomatis."
        : "Username Admin berhasil diperbarui! Sesi Anda telah disinkronkan otomatis.",
    securityInfo: {
      username: requestedUsername,
      isCustomUsername: true,
      isCustomPassword: isPasswordProvided || activeCreds.isCustomPassword,
      updatedAt: updatedAtIso,
    },
  };
}

// Lazy garbage collection for soft deleted items (7-day retention)
export async function purgeExpiredDeletedItems() {
  if (!isSupabaseConfigured()) return;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [{ data: menus }, { data: slides }, { data: pkgs }] = await Promise.all([
      supabaseAdmin.from("menu_items").select("id, image").lt("deleted_at", sevenDaysAgo),
      supabaseAdmin.from("hero_slides").select("id, image").lt("deleted_at", sevenDaysAgo),
      supabaseAdmin.from("partnership_packages").select("id, image").lt("deleted_at", sevenDaysAgo),
    ]);

    const filesToDelete = [
      ...(menus || []).map((m) => m.image),
      ...(slides || []).map((s) => s.image),
      ...(pkgs || []).map((p) => p.image),
    ].filter(Boolean) as string[];

    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map((img) => deleteStorageFile(img)));
    }

    await Promise.all([
      menus && menus.length > 0
        ? supabaseAdmin.from("menu_items").delete().in("id", menus.map((i) => i.id))
        : Promise.resolve(),
      slides && slides.length > 0
        ? supabaseAdmin.from("hero_slides").delete().in("id", slides.map((i) => i.id))
        : Promise.resolve(),
      pkgs && pkgs.length > 0
        ? supabaseAdmin.from("partnership_packages").delete().in("id", pkgs.map((i) => i.id))
        : Promise.resolve(),
      supabaseAdmin.from("branches").delete().lt("deleted_at", sevenDaysAgo),
      supabaseAdmin.from("links").delete().lt("deleted_at", sevenDaysAgo),
      supabaseAdmin.from("testimonials").delete().lt("deleted_at", sevenDaysAgo),
      supabaseAdmin.from("faqs").delete().lt("deleted_at", sevenDaysAgo),
    ]);
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

const cachedGetMenuItems = cache(async (): Promise<MenuItem[]> => {
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
});

export async function getMenuItems(): Promise<MenuItem[]> {
  return cachedGetMenuItems();
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

const cachedGetBranches = cache(async (): Promise<Branch[]> => {
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
});

export async function getBranches(): Promise<Branch[]> {
  return cachedGetBranches();
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

const cachedGetCategories = cache(async (): Promise<Category[]> => {
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
});

export async function getCategories(): Promise<Category[]> {
  return cachedGetCategories();
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
      id: "mock-" + Math.random().toString(36).slice(2, 11),
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
  const wa = "628213444730";
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

  const wa = "628213444730";
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

const cachedGetAllSiteSettings = cache(async (): Promise<Record<string, string>> => {
  if (!isSupabaseConfigured()) {
    return fallbackSettings;
  }
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .not("key", "like", "__admin_%");
    if (error) throw error;
    if (!data || data.length === 0) return fallbackSettings;

    const result: Record<string, string> = { ...fallbackSettings };
    data.forEach((item: { key: string; value: string }) => {
      if (!item.key.startsWith("__admin_")) {
        result[item.key] = item.value;
      }
    });
    if (!result.wa_number || result.wa_number.includes("877")) {
      result.wa_number = "628213444730";
    }
    if (!result.wa_number_formatted || result.wa_number_formatted.includes("877")) {
      result.wa_number_formatted = "+62 821-3444-730";
    }
    return result;
  } catch (err) {
    console.error("Error fetching site settings from Supabase:", err);
    return fallbackSettings;
  }
});

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  return cachedGetAllSiteSettings();
}

export async function updateAllSiteSettings(settings: Record<string, string>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const rows = Object.entries(settings)
    .filter(([key]) => !key.startsWith("__admin_"))
    .map(([key, value]) => ({
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
    description: "Resto premium & full experience. Ukuran: 6 x 8 METER. Konsep flagship resto dengan kapasitas 30-36 orang, area dine in & take away terpisah, serta dapur belakang yang efisien.",
    badge: "Flagship Resto",
    image: "/packages/resto-outlet-3.jpg",
    inclusions: [
      "Desain Interior & Renovasi Full Experience (6 x 8 M)",
      "Kapasitas Dine-in Nyaman (30 - 36 Orang)",
      "Area Order & Take Away Terpisah",
      "Dapur di Bagian Belakang & Peralatan Lengkap",
      "Desain Modern, Terang & Identitas Ayapi Kuat",
      "Cocok untuk Ruko, Perumahan, & Area Ramai",
      "Peralatan Dapur Premium Kapasitas Maksimal",
      "Paket Bahan Baku & Bumbu Terlengkap",
      "Sistem POS Kasir & Pelatihan Komprehensif",
      "Media Promosi Lengkap & Branding Eksklusif",
      "Terdaftar di Platform Pesan Antar Online",
      "Pendampingan Grand Opening Tim Pusat & Operasional",
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
      .is("deleted_at", null)
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

  // If image is changing, delete old storage file if it belongs to storage
  if (pkg.image) {
    try {
      const { data: oldPkg } = await supabaseAdmin
        .from("partnership_packages")
        .select("image")
        .eq("id", id)
        .single();
      if (oldPkg?.image && oldPkg.image !== pkg.image) {
        await deleteStorageFile(oldPkg.image);
      }
    } catch (e) {
      console.warn("Could not clean old package image:", e);
    }
  }

  const { id: _unusedId, ...payload } = pkg;
  void _unusedId;
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
      .is("deleted_at", null)
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
   12. PROMO ITEMS (POP-UP & HOME BANNER) ACTIONS
   ========================================================================= */

async function fetchAllPromosFromStorage(): Promise<PromoItem[]> {
  if (!isSupabaseConfigured()) return defaultPromoItems;
  try {
    const { data, error } = await supabase.from("settings").select("value").eq("key", "site_promos").single();
    if (error || !data?.value) {
      return defaultPromoItems;
    }
    const parsed = JSON.parse(data.value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return defaultPromoItems;
  } catch (err) {
    console.error("Error reading promos from settings:", err);
    return defaultPromoItems;
  }
}

async function saveAllPromosToStorage(items: PromoItem[]) {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabaseAdmin.from("settings").upsert({
    key: "site_promos",
    value: JSON.stringify(items),
  });
  if (error) {
    console.error("Error saving promos to settings:", error);
    throw new Error(error.message || "Gagal menyimpan promo.");
  }
}

// Public: fetch active promos
export async function getPromos(): Promise<PromoItem[]> {
  const all = await fetchAllPromosFromStorage();
  return all
    .filter((item) => (item.is_active ?? true) && !item.deleted_at)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

// Admin: fetch all promos
export async function getAdminPromos(): Promise<PromoItem[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  const all = await fetchAllPromosFromStorage();
  return all
    .filter((item) => !item.deleted_at)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function addPromo(promo: Omit<PromoItem, "id" | "created_at">) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  const all = await fetchAllPromosFromStorage();
  const maxOrder = all.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0);
  const newPromo: PromoItem = {
    ...promo,
    id: "promo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
    sort_order: promo.sort_order ?? maxOrder + 1,
    is_active: promo.is_active ?? true,
    deleted_at: null,
    created_at: new Date().toISOString(),
  };
  all.push(newPromo);
  await saveAllPromosToStorage(all);
  revalidatePath("/");
  revalidatePath("/admin");
  return newPromo;
}

export async function updatePromo(id: string, updates: Partial<PromoItem>) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  const all = await fetchAllPromosFromStorage();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Promo tidak ditemukan.");
  all[index] = {
    ...all[index],
    ...updates,
    details: {
      ...all[index].details,
      ...(updates.details || {}),
    },
  };
  await saveAllPromosToStorage(all);
  revalidatePath("/");
  revalidatePath("/admin");
  return all[index];
}

export async function deletePromo(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  const all = await fetchAllPromosFromStorage();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Promo tidak ditemukan.");
  all[index].deleted_at = new Date().toISOString();
  await saveAllPromosToStorage(all);
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data: all[index] };
}

export async function restorePromo(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  const all = await fetchAllPromosFromStorage();
  const index = all.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Promo tidak ditemukan.");
  all[index].deleted_at = null;
  await saveAllPromosToStorage(all);
  revalidatePath("/");
  revalidatePath("/admin");
  return all[index];
}

export async function swapPromoOrder(id1: string, order1: number, id2: string, order2: number) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");
  const all = await fetchAllPromosFromStorage();
  const item1 = all.find((i) => i.id === id1);
  const item2 = all.find((i) => i.id === id2);
  if (item1 && item2) {
    item1.sort_order = order2;
    item2.sort_order = order1;
    await saveAllPromosToStorage(all);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

/* =========================================================================
   13. TRASH BIN (KERANJANG SAMPAH) ACTIONS
   ========================================================================= */

export type TrashItem = {
  id: string;
  type: "menu" | "branch" | "link" | "slideshow" | "testimonial" | "package" | "faq" | "promo";
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
      { data: branches },
      { data: links },
      { data: slides },
      { data: testimonials },
      { data: packages },
      { data: faqs },
    ] = await Promise.all([
      supabaseAdmin.from("menu_items").select("id, name, category, image, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("branches").select("id, name, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("links").select("id, title, url, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("hero_slides").select("id, title, alt, image, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("testimonials").select("id, name, role, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("partnership_packages").select("id, name, price_text, image, deleted_at").not("deleted_at", "is", null),
      supabaseAdmin.from("faqs").select("id, question, deleted_at").not("deleted_at", "is", null),
    ]);

    if (menus) {
      menus.forEach((m) => trash.push({ id: m.id, type: "menu", title: m.name, subtitle: `Menu (${m.category})`, image: m.image, deleted_at: m.deleted_at }));
    }
    if (branches) {
      branches.forEach((b) => trash.push({ id: b.id, type: "branch", title: b.name, subtitle: "Cabang Outlet", deleted_at: b.deleted_at }));
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
    if (packages) {
      packages.forEach((pkg) => trash.push({ id: pkg.id, type: "package", title: pkg.name, subtitle: `Paket Kemitraan (${pkg.price_text})`, image: pkg.image, deleted_at: pkg.deleted_at }));
    }
    if (faqs) {
      faqs.forEach((f) => trash.push({ id: f.id, type: "faq", title: f.question, subtitle: "FAQ Kemitraan", deleted_at: f.deleted_at }));
    }

    const allPromos = await fetchAllPromosFromStorage();
    allPromos.filter(p => p.deleted_at).forEach(p => {
      trash.push({
        id: p.id,
        type: "promo",
        title: p.title,
        subtitle: `Promo Pop-up (${p.badge})`,
        image: p.image,
        deleted_at: p.deleted_at!,
      });
    });

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
  if (!isSupabaseConfigured()) return { success: true };

  if (type === "promo") {
    const all = await fetchAllPromosFromStorage();
    const item = all.find((i) => i.id === id);
    if (item?.image) await deleteStorageFile(item.image);
    if (item?.bannerImage && item.bannerImage !== item.image) await deleteStorageFile(item.bannerImage);
    const updated = all.filter((i) => i.id !== id);
    await saveAllPromosToStorage(updated);
    revalidatePath("/admin");
    return { success: true };
  }

  if (!isValidUuid(id)) return { success: true };

  const tableMap: Record<Exclude<TrashItem["type"], "promo">, string> = {
    menu: "menu_items",
    branch: "branches",
    link: "links",
    slideshow: "hero_slides",
    testimonial: "testimonials",
    package: "partnership_packages",
    faq: "faqs",
  };

  const tableName = tableMap[type as Exclude<TrashItem["type"], "promo">];
  if (!tableName) return { success: false };

  if (type === "menu" || type === "slideshow" || type === "package") {
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
  if (!isSupabaseConfigured()) return { success: true };

  if (type === "promo") {
    await restorePromo(id);
    revalidatePath("/admin");
    return { success: true };
  }

  if (!isValidUuid(id)) return { success: true };

  const tableMap: Record<Exclude<TrashItem["type"], "promo">, string> = {
    menu: "menu_items",
    branch: "branches",
    link: "links",
    slideshow: "hero_slides",
    testimonial: "testimonials",
    package: "partnership_packages",
    faq: "faqs",
  };

  const tableName = tableMap[type as Exclude<TrashItem["type"], "promo">];
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
    await Promise.all(
      trashItems
        .filter((item) => item.image)
        .map((item) => deleteStorageFile(item.image!))
    );

    const allPromos = await fetchAllPromosFromStorage();
    const activePromos = allPromos.filter((p) => !p.deleted_at);
    if (activePromos.length !== allPromos.length) {
      await saveAllPromosToStorage(activePromos);
    }

    await Promise.all([
      supabaseAdmin.from("menu_items").delete().not("deleted_at", "is", null),
      supabaseAdmin.from("branches").delete().not("deleted_at", "is", null),
      supabaseAdmin.from("links").delete().not("deleted_at", "is", null),
      supabaseAdmin.from("hero_slides").delete().not("deleted_at", "is", null),
      supabaseAdmin.from("testimonials").delete().not("deleted_at", "is", null),
      supabaseAdmin.from("partnership_packages").delete().not("deleted_at", "is", null),
      supabaseAdmin.from("faqs").delete().not("deleted_at", "is", null),
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error emptying trash:", err);
    throw err;
  }
}


