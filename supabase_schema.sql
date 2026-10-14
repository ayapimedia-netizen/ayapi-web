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
  ('wa_number', '628213444730'),
  ('wa_number_formatted', '+62 821-3444-730'),
  ('cs_email', 'ayapihr@gmail.com'),
  ('headquarter_address', 'Jl. Tukad Pakerisan No.96, Dauh Puri Klod, Kec. Denpasar Barat, Kota Denpasar, Bali'),
  ('instagram_url', 'https://instagram.com/ayapikrispibar'),
  ('tiktok_url', 'https://tiktok.com/@ayapikrispibar'),
  ('halal_cert_number', 'ID3111000012345'),
  ('haki_cert_number', 'IPT2024001234'),
  ('roi_cogs_percent', '55'),
  ('theme', 'peach')
ON CONFLICT (key) DO NOTHING;

-- Seed Partnership Packages
INSERT INTO public.partnership_packages (package_key, name, price_text, price_value, description, badge, image, inclusions, sort_order) VALUES
  ('express-1', 'Paket Express 1', '15 Juta*', 15000000, 'Lebih Ringkas, Tetap Menarik! Dimensi Rombong: 100 x 60 x 160 cm. Konsep praktis, hemat tempat, cocok untuk pemula dan lokasi padat lalu lintas.', 'Budget Friendly', '/express_booth_mockup.png', '["Rombong Express Ringkas (100 x 60 x 160 cm)", "Peralatan Masak & Penggorengan Lengkap", "Starter Kit Bahan Baku Awal (Ayam & Bumbu)", "Media Promosi Fisik (Banner & Menu)", "SOP Penyajian & Pelatihan Karyawan", "Terdaftar di Platform Pesan Antar Online"]'::jsonb, 1),
  ('express-2', 'Paket Express 2', '28 Juta*', 28000000, 'Rombong Lebih Luas, Tampilan Lebih Maksimal! Dimensi Rombong: 125 x 60 x 200 cm. Kapasitas display etalase lebih luas untuk omzet harian lebih tinggi.', 'Best Value!', '/express_booth_mockup.png', '["Rombong Express Luas (125 x 60 x 200 cm)", "Peralatan Lengkap & Display Etalase Luas", "Starter Kit Bahan Baku Skala Menengah", "Media Promosi Lengkap & Branding Eksklusif", "Sistem POS Kasir & Pelatihan Komprehensif", "Support Promosi & Integrasi Ojol Delivery"]'::jsonb, 2),
  ('resto-1', 'Paket Resto 1', '90 Juta*', 90000000, 'Resto minimalis & fungsional. Ukuran: 4 x 6 METER. Solusi ideal menghadirkan pengalaman dine-in hemat namun tetap nyaman dan estetik.', 'Resto Minimalis', '/mini_resto_mockup.png', '["Layout Outlet Minimalis & Fungsional (4 x 6 M)", "Set Peralatan Resto & Dapur Komersial Standar", "Set Meja & Kursi Dine-in Pelanggan", "Starter Kit Bahan Baku & Bumbu Rempah", "Sistem Kasir Cloud POS & Training Manajemen", "Media Promosi & Panduan Branding Resto"]'::jsonb, 3),
  ('resto-2', 'Paket Resto 2', '135 Juta*', 135000000, 'Resto modern & lebih luas. Ukuran: 5 x 7 METER. Menampung lebih banyak pelanggan dengan atmosfer modern dan operasional yang efisien.', 'Resto Modern', '/mini_resto_mockup.png', '["Layout Outlet Modern & Luas (5 x 7 M)", "Peralatan Dapur Komersial Stainless Steel", "Kapasitas Dine-in Nyaman & Estetik", "Starter Kit Bahan Baku Skala Besar", "Sistem POS Kasir, Tablet, & SOP Lengkap", "Support Grand Opening & Marketing Sosmed"]'::jsonb, 4),
  ('resto-3', 'Paket Resto 3', '180 Juta*', 180000000, 'Resto premium & full experience. Ukuran: 6 x 8 METER. Konsep flagship resto dengan kapasitas maksimal, interior mewah, dan pengalaman kuliner terlengkap.', 'Full Experience', '/premium_resto_mockup.png', '["Desain Interior & Renovasi Full Experience (6 x 8 M)", "Peralatan Dapur Premium Kapasitas Maksimal", "Kapasitas Dine-in Luas & Nyaman (30+ Kursi)", "Paket Bahan Baku Terlengkap", "Pendampingan Grand Opening Tim Pusat", "Kampanye Marketing & Influencer Launching"]'::jsonb, 5)
ON CONFLICT DO NOTHING;

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
