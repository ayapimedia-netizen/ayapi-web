"use server";

import { cookies } from "next/headers";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";
import { getSecureSessionToken } from "@/lib/auth-helper";
import { revalidatePath } from "next/cache";

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
};

export type Branch = {
  id?: string;
  name: string;
  gofood: string;
  grabfood: string;
  shopeefood: string;
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

// Fallback Static Data in case Supabase is not connected/configured
const fallbackMenuItems: MenuItem[] = [
  {
    id: "fb-1",
    name: "Ayapi Krisbar Original",
    price: "Rp 22.000",
    description: "Ayam goreng tepung krispi gurih yang dibakar dengan balutan saus manis pedas khas Ayapi.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
    category: "krisbar",
  },
  {
    id: "fb-2",
    name: "Ayapi Krisbar Madu",
    price: "Rp 24.000",
    description: "Ayam krispi bakar berlapis madu murni manis gurih legit dengan bumbu rempah pilihan.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
    category: "krisbar",
  },
  {
    id: "fb-3",
    name: "Ayapi Krisbar Cheese",
    price: "Rp 25.000",
    description: "Ayam krispi bakar lezat disiram saus keju cheddar creamy gurih yang berlimpah.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
    category: "krisbar",
  },
  {
    id: "fb-4",
    name: "Paket Krisbar Hemat",
    price: "Rp 27.000",
    description: "Nasi putih hangat + Ayam Krisbar Original + lalapan segar (kol, timun, kemangi) + Sambal.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80",
    category: "paket",
  },
  {
    id: "fb-5",
    name: "Paket Krisbar Duo",
    price: "Rp 45.000",
    description: "Nasi hangat + 2 Ayam Krisbar Original + Es Teh manis segar + lalapan dan sambal nikmat.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
    category: "paket",
  },
  {
    id: "fb-6",
    name: "Paket Krisbar Family",
    price: "Rp 95.000",
    description: "Porsi keluarga! 5 Ayam Krisbar Original + 4 Nasi putih + 4 Es Teh + sambal ekstra besar.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80",
    category: "paket",
  },
  {
    id: "fb-7",
    name: "Paket Geprek Krisbar",
    price: "Rp 25.000",
    description: "Nasi hangat + Ayam krispi bakar yang digeprek dengan sambal korek bawang rawit merah super pedas.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
    category: "geprek",
  },
  {
    id: "fb-8",
    name: "Paket Geprek Krisbar Ijo",
    price: "Rp 26.000",
    description: "Nasi hangat + Ayam krispi bakar digeprek dengan sambal hijau cabai ijo besar Padang segar gurih.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
    category: "geprek",
  },
  {
    id: "fb-9",
    name: "Sambal Korek Bawang",
    price: "Rp 4.000",
    description: "Sambal bawang rawit pedas murni disiram minyak kelapa panas, cocok untuk cocolan.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=80",
    category: "sambal",
  },
  {
    id: "fb-10",
    name: "Sambal Ijo Padang",
    price: "Rp 4.000",
    description: "Sambal cabai hijau muda khas Minang dengan rasa pedas lembut gurih dan aroma harum.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
    category: "sambal",
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

// Helper: Check if Supabase project URL is default placeholder
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return url && !url.includes("your-project") && key && !key.includes("your-anon-key");
}

/* =========================================================================
   1. ADMIN AUTHENTICATION ACTIONS
   ========================================================================= */

export async function loginAdmin(formData: FormData) {
  const usernameInput = formData.get("username") as string;
  const passwordInput = formData.get("password") as string;

  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";

  if (usernameInput === adminUser && passwordInput === adminPass) {
    const cookieStore = await cookies();
    const token = getSecureSessionToken();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });
    return { success: true };
  }

  // Delay 1.5 seconds to throttle automated brute-force attacks
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: false, error: "Username atau password salah!" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const expectedToken = getSecureSessionToken();
  return session?.value === expectedToken;
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
      .order("created_at", { ascending: true });

    if (error) throw error;
    
    // If table is empty, seed it with fallback menu items for demo convenience
    if (data.length === 0) {
      console.log("Database table 'menu_items' is empty. Seeding with default data...");
      const seedItems = fallbackMenuItems.map((item) => ({
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        category: item.category
      }));
      const { data: seeded, error: seedError } = await supabaseAdmin
        .from("menu_items")
        .insert(seedItems)
        .select();
      
      if (!seedError && seeded) return seeded;
    }
    
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

  // Fetch the item first to get its image URL for storage cleanup
  const { data: item, error: fetchError } = await supabaseAdmin
    .from("menu_items")
    .select("image")
    .eq("id", id)
    .single();

  if (!fetchError && item?.image) {
    await deleteStorageFile(item.image);
  }

  const { error } = await supabaseAdmin
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/");
  return { success: true };
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
      .order("created_at", { ascending: true });

    if (error) throw error;
    
    // Seed database if empty
    if (data.length === 0) {
      console.log("Database table 'gallery_items' is empty. Seeding with default data...");
      const seedItems = fallbackGalleryItems.map((item) => ({
        title: item.title,
        image: item.image,
        category: item.category
      }));
      const { data: seeded, error: seedError } = await supabaseAdmin
        .from("gallery_items")
        .insert(seedItems)
        .select();
      
      if (!seedError && seeded) return seeded;
    }
    
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

  // Fetch the item first to get its image URL for storage cleanup
  const { data: item, error: fetchError } = await supabaseAdmin
    .from("gallery_items")
    .select("image")
    .eq("id", id)
    .single();

  if (!fetchError && item?.image) {
    await deleteStorageFile(item.image);
  }

  const { error } = await supabaseAdmin
    .from("gallery_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }

  revalidatePath("/gallery");
  return { success: true };
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
        console.warn("Supabase Storage upload failed, falling back to local storage:", error.message);
      } else if (data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("ayapi-media")
          .getPublicUrl(safeFileName);
        
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl };
        }
      }
    } catch (err) {
      console.warn("Error uploading to Supabase Storage, falling back to local:", err);
    }
  }

  // Strategy B: Fallback to local file upload (/public/uploads)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, safeFileName);
    await fs.writeFile(filePath, buffer);
    
    console.log(`Saved file locally at: /uploads/${safeFileName}`);
    return { url: `/uploads/${safeFileName}` };
  } catch (err) {
    console.error("Failed to upload image locally:", err);
    throw new Error("Gagal mengunggah gambar ke cloud maupun lokal.");
  }
}

/* =========================================================================
   5. BRANCH / OUTLET MANAGEMENT ACTIONS
   ========================================================================= */

const fallbackBranches: Branch[] = [
  {
    name: "Ayapi Tebet, Jakarta Selatan",
    gofood: "https://gofood.link/a/FghJkL",
    grabfood: "https://r.grab.com/g/f/3-C2JDTX5JFAK8JA",
    shopeefood: "https://shopee.co.id/universal-link/now-food/shop/1002345",
  },
  {
    name: "Ayapi Margonda, Depok",
    gofood: "https://gofood.link/a/AbCdEf",
    grabfood: "https://r.grab.com/g/f/3-D8YTRN2K9DJ2KD",
    shopeefood: "https://shopee.co.id/universal-link/now-food/shop/1002346",
  },
  {
    name: "Ayapi Dago, Bandung",
    gofood: "https://gofood.link/a/XyZ123",
    grabfood: "https://r.grab.com/g/f/3-F9KLJNDK3JD9DK",
    shopeefood: "https://shopee.co.id/universal-link/now-food/shop/1002347",
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
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Seed database if empty
    if (data.length === 0) {
      console.log("Database table 'branches' is empty. Seeding with default data...");
      const seedItems = fallbackBranches.map((b) => ({
        name: b.name,
        gofood: b.gofood,
        grabfood: b.grabfood,
        shopeefood: b.shopeefood
      }));
      
      const { data: seeded, error: seedError } = await supabaseAdmin
        .from("branches")
        .insert(seedItems)
        .select();

      if (!seedError && seeded) return seeded;
    }

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
  return data;
}

export async function deleteBranch(id: string) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabaseAdmin
    .from("branches")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
  return { success: true };
}

export async function deleteBranches(ids: string[]) {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) throw new Error("Unauthorized");

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabaseAdmin
    .from("branches")
    .delete()
    .in("id", ids);

  if (error) {
    console.error("Error deleting branches:", error);
    throw error;
  }

  revalidatePath("/menu");
  revalidatePath("/kontak");
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
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured. Lead not saved.");
    return { success: false };
  }

  const { data, error } = await supabaseAdmin
    .from("partnership_leads")
    .insert([
      {
        name: lead.name,
        phone: lead.phone,
        status: "Baru",
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
  { key: "krisbar", name: "Ayam Krisbar" },
  { key: "paket", name: "Paket Hemat" },
  { key: "geprek", name: "Ayam Geprek" },
  { key: "sambal", name: "Aneka Sambal" },
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

    // Seed database if empty
    if (data.length === 0) {
      console.log("Database table 'categories' is empty. Seeding with default data...");
      const seedItems = fallbackCategories.map((c) => ({
        key: c.key,
        name: c.name,
      }));
      
      const { data: seeded, error: seedError } = await supabaseAdmin
        .from("categories")
        .insert(seedItems)
        .select();

      if (!seedError && seeded) return seeded;
    }

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

