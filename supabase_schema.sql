-- =========================================================================
-- AYAPI DATABASE SCHEMA SETUP
-- Jalankan kueri SQL ini di tab SQL Editor di Dashboard Supabase Anda.
-- =========================================================================

-- 1. Buat Tabel partnership_leads jika belum ada
CREATE TABLE IF NOT EXISTS public.partnership_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'Baru' NOT NULL, -- 'Baru', 'Dihubungi', 'Batal', 'Mitra Resmi'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS) pada tabel partnership_leads
ALTER TABLE public.partnership_leads ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS (Security Policies)
-- Izinkan anonim / publik untuk melakukan insert (menyimpan prospek dari form kemitraan)
CREATE POLICY "Izinkan publik untuk memasukkan data leads" 
ON public.partnership_leads 
FOR INSERT 
WITH CHECK (true);

-- Izinkan admin (service_role) untuk melakukan select, update, delete secara penuh
-- (Bawaan Supabase, akun dengan Service Role Key/Admin membypass semua RLS otomatis).

-- 4. Buat Tabel menu_items jika belum ada
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL, -- 'krisbar', 'paket', 'geprek', 'sambal'
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Aktifkan RLS dan Kebijakan pada menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Izinkan publik untuk melihat menu" 
ON public.menu_items 
FOR SELECT 
USING (true);

-- 6. Buat Tabel gallery_items jika belum ada
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. Aktifkan RLS dan Kebijakan pada gallery_items
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Izinkan publik untuk melihat galeri" 
ON public.gallery_items 
FOR SELECT 
USING (true);

-- 8. Buat Tabel branches jika belum ada
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    gofood TEXT DEFAULT '' NOT NULL,
    grabfood TEXT DEFAULT '' NOT NULL,
    shopeefood TEXT DEFAULT '' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Aktifkan RLS dan Kebijakan pada branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Izinkan publik untuk melihat cabang" 
ON public.branches 
FOR SELECT 
USING (true);

-- 10. Buat Tabel categories jika belum ada
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 11. Aktifkan RLS dan Kebijakan pada categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Izinkan publik untuk melihat kategori" 
ON public.categories 
FOR SELECT 
USING (true);

-- 12. Buat Tabel orders jika belum ada
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    notes TEXT DEFAULT '' NOT NULL,
    total_price INTEGER NOT NULL,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Confirmed', 'Cancelled'
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 13. Aktifkan RLS dan Kebijakan pada orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Izinkan publik untuk memasukkan data order" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);


