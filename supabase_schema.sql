-- =========================================================================
-- MASTER AYAPI DATABASE SCHEMA SETUP (ALL-IN-ONE RE-INITIALIZATION)
-- Jalankan kueri SQL ini di tab SQL Editor pada Dashboard Supabase Baru Anda.
-- =========================================================================

-- 1. Tabel partnership_leads
CREATE TABLE IF NOT EXISTS public.partnership_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'Baru' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.partnership_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik untuk memasukkan data leads" ON public.partnership_leads;
CREATE POLICY "Izinkan publik untuk memasukkan data leads" 
ON public.partnership_leads 
FOR INSERT 
WITH CHECK (true);


-- 2. Tabel menu_items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik untuk melihat menu" ON public.menu_items;
CREATE POLICY "Izinkan publik untuk melihat menu" 
ON public.menu_items 
FOR SELECT 
USING (deleted_at IS NULL AND is_available = true);


-- 3. Tabel categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik untuk melihat kategori" ON public.categories;
CREATE POLICY "Izinkan publik untuk melihat kategori" 
ON public.categories 
FOR SELECT 
USING (true);


-- 4. Tabel gallery_items
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik untuk melihat galeri" ON public.gallery_items;
CREATE POLICY "Izinkan publik untuk melihat galeri" 
ON public.gallery_items 
FOR SELECT 
USING (deleted_at IS NULL);


-- 5. Tabel branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    gofood TEXT DEFAULT '' NOT NULL,
    grabfood TEXT DEFAULT '' NOT NULL,
    shopeefood TEXT DEFAULT '' NOT NULL,
    open_time TEXT DEFAULT '10:00' NOT NULL,
    close_time TEXT DEFAULT '22:00' NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik untuk melihat cabang" ON public.branches;
CREATE POLICY "Izinkan publik untuk melihat cabang" 
ON public.branches 
FOR SELECT 
USING (deleted_at IS NULL);


-- 6. Tabel orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    notes TEXT DEFAULT '' NOT NULL,
    total_price INTEGER NOT NULL,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik untuk memasukkan data order" ON public.orders;
CREATE POLICY "Izinkan publik untuk memasukkan data order" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);


-- 7. Tabel links
CREATE TABLE IF NOT EXISTS public.links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '' NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    clicks INTEGER DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca link aktif" ON public.links;
CREATE POLICY "Izinkan publik membaca link aktif"
ON public.links
FOR SELECT
USING (is_active = true AND deleted_at IS NULL);


-- 8. Tabel settings
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca settings" ON public.settings;
CREATE POLICY "Izinkan publik membaca settings"
ON public.settings
FOR SELECT
USING (true);


-- 9. Tabel hero_slides
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image TEXT NOT NULL,
    alt TEXT NOT NULL,
    badge TEXT DEFAULT '🔥 KULINER FRANCHISE TERBAIK' NOT NULL,
    title TEXT DEFAULT 'Aroma Smoky Juara, Bisnis Kuliner Luar Biasa' NOT NULL,
    sub TEXT DEFAULT '' NOT NULL,
    button_text TEXT DEFAULT '🍔 Lihat Menu Terlezat' NOT NULL,
    button_link TEXT DEFAULT '/menu' NOT NULL,
    button2_text TEXT DEFAULT '💼 Peluang Kemitraan' NOT NULL,
    button2_link TEXT DEFAULT '/kemitraan' NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca slide aktif" ON public.hero_slides;
CREATE POLICY "Izinkan publik membaca slide aktif"
ON public.hero_slides
FOR SELECT
USING (is_active = true AND deleted_at IS NULL);


-- 10. Tabel testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    rating INTEGER DEFAULT 5 NOT NULL,
    review TEXT NOT NULL,
    initials TEXT NOT NULL,
    bg_gradient TEXT DEFAULT 'from-red-500 to-orange-500' NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca testimoni aktif" ON public.testimonials;
CREATE POLICY "Izinkan publik membaca testimoni aktif"
ON public.testimonials
FOR SELECT
USING (is_active = true AND deleted_at IS NULL);


-- 11. Tabel partnership_packages
CREATE TABLE IF NOT EXISTS public.partnership_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    package_key TEXT NOT NULL,
    name TEXT NOT NULL,
    price_text TEXT NOT NULL,
    price_value BIGINT NOT NULL,
    description TEXT NOT NULL,
    badge TEXT DEFAULT '' NOT NULL,
    image TEXT NOT NULL,
    inclusions JSONB NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.partnership_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca paket kemitraan" ON public.partnership_packages;
CREATE POLICY "Izinkan publik membaca paket kemitraan"
ON public.partnership_packages
FOR SELECT
USING (deleted_at IS NULL);


-- 12. Tabel faqs
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Izinkan publik membaca faq aktif" ON public.faqs;
CREATE POLICY "Izinkan publik membaca faq aktif"
ON public.faqs
FOR SELECT
USING (is_active = true AND deleted_at IS NULL);


-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Seed Categories
INSERT INTO public.categories (key, name) VALUES
  ('krisbar', 'Ayam Krisbar'),
  ('paket', 'Paket Hemat'),
  ('geprek', 'Geprek Krisbar'),
  ('sambal', 'Sambal & Ekstra')
ON CONFLICT (key) DO NOTHING;

-- Seed Settings
INSERT INTO public.settings (key, value) VALUES
  ('wa_number', '6287777652032'),
  ('wa_number_formatted', '+62 877-7765-2032'),
  ('cs_email', 'info@ayapikrispibar.com'),
  ('headquarter_address', 'Jl. Mawar Indah No. 12, Jakarta Selatan, Indonesia'),
  ('instagram_url', 'https://instagram.com/ayapikrispibar'),
  ('tiktok_url', 'https://tiktok.com/@ayapikrispibar'),
  ('halal_cert_number', 'ID3111000012345'),
  ('haki_cert_number', 'IPT2024001234'),
  ('roi_cogs_percent', '55'),
  ('theme', 'peach')
ON CONFLICT (key) DO NOTHING;

-- Storage Bucket untuk Media Upload
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ayapi-media', 'ayapi-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Access for ayapi-media" ON storage.objects;
CREATE POLICY "Public Read Access for ayapi-media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ayapi-media');

DROP POLICY IF EXISTS "Admin Upload Access for ayapi-media" ON storage.objects;
CREATE POLICY "Admin Upload Access for ayapi-media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'ayapi-media');
