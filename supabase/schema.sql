-- ==============================================================================
-- Real Estate In Bahria Town / Orchard Lahore
-- Production Supabase Database Schema & Row Level Security (RLS)
-- Authorized Administrator: sa3840213@gmail.com
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ADMIN ALLOWLIST TABLE (Database-Backed Authorization)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed authorized admin account
INSERT INTO public.admin_users (email, role)
VALUES ('sa3840213@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    property_type TEXT NOT NULL DEFAULT 'House',
    listing_type TEXT NOT NULL DEFAULT 'Sale',
    purpose TEXT NOT NULL DEFAULT 'Sale',
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT 'Bahria Town Lahore',
    area TEXT NOT NULL DEFAULT '10 Marla',
    area_value NUMERIC(10, 2) DEFAULT 10,
    area_unit TEXT NOT NULL DEFAULT 'Marla',
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    parking_spaces INTEGER DEFAULT 0,
    cover_image TEXT DEFAULT '',
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'published', -- 'draft', 'published', 'sold', 'rented'
    featured BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    property_code TEXT,
    city TEXT NOT NULL DEFAULT 'Lahore',
    province TEXT NOT NULL DEFAULT 'Punjab',
    society TEXT DEFAULT 'Bahria Town Lahore',
    block TEXT DEFAULT '',
    address TEXT DEFAULT '',
    latitude NUMERIC(10, 8) DEFAULT 31.3687,
    longitude NUMERIC(11, 8) DEFAULT 74.1782,
    agent_id UUID,
    views_count INTEGER NOT NULL DEFAULT 0,
    features TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON public.properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- 4. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_code TEXT,
    property_title TEXT,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'closed', etc.
    source TEXT DEFAULT 'website',
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.contact_inquiries(status);

-- 5. AGENTS / PROPERTY CONSULTANTS TABLE
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    avatar_url TEXT,
    title TEXT NOT NULL DEFAULT 'Senior Real Estate Consultant',
    agency_name TEXT DEFAULT 'Real Estate In Bahria Town / Orchard Lahore',
    license_number TEXT,
    bio TEXT NOT NULL DEFAULT '',
    experience_years INTEGER NOT NULL DEFAULT 5,
    areas_served TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    full_description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Home',
    benefits TEXT[] DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    role TEXT DEFAULT 'Client',
    avatar_url TEXT,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    property_type TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    business_name TEXT NOT NULL DEFAULT 'Real Estate In Bahria Town / Orchard Lahore',
    tagline TEXT NOT NULL DEFAULT 'Property Services in Bahria Town, Bahria Orchard & Lahore',
    logo_url TEXT,
    business_description TEXT,
    phone TEXT NOT NULL DEFAULT '+92 324 4101140',
    whatsapp TEXT NOT NULL DEFAULT '+92 324 4101140',
    email TEXT NOT NULL DEFAULT 'info@realestatebahriatown.com',
    address TEXT NOT NULL DEFAULT 'Tower 3, Office #17, Raiwind Road, Bahria Orchard, Eastern District, Lahore, Punjab 54000, Pakistan',
    city TEXT NOT NULL DEFAULT 'Lahore',
    plus_code TEXT NOT NULL DEFAULT '8689+FP Lahore, Pakistan',
    google_maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=8689%2BFP+Lahore+Pakistan',
    business_hours TEXT NOT NULL DEFAULT 'Mon-Thu, Sat-Sun: 9:00 AM – 10:00 PM | Fri: 11:00 AM – 10:00 PM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    society TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Security Definer Function: Verifies authenticated user against administrator allowlist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
BEGIN
    user_email := LOWER(COALESCE(auth.jwt() ->> 'email', ''));
    IF user_email = 'sa3840213@gmail.com' THEN
        RETURN true;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE LOWER(email) = user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Admin Users Policies
DROP POLICY IF EXISTS "Admin view admin_users" ON public.admin_users;
CREATE POLICY "Admin view admin_users" ON public.admin_users
    FOR SELECT TO authenticated USING (public.is_admin());

-- Properties Policies
DROP POLICY IF EXISTS "Public view properties" ON public.properties;
CREATE POLICY "Public view properties" ON public.properties
    FOR SELECT USING (
        status = 'published' OR 
        status = 'Available' OR 
        is_published = true OR 
        public.is_admin()
    );

DROP POLICY IF EXISTS "Admin manage properties" ON public.properties;
CREATE POLICY "Admin manage properties" ON public.properties
    FOR ALL TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Inquiries Policies: Anyone can submit, only authorized administrator can view/manage
DROP POLICY IF EXISTS "Public insert inquiries" ON public.contact_inquiries;
CREATE POLICY "Public insert inquiries" ON public.contact_inquiries
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin view inquiries" ON public.contact_inquiries
    FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin update inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin update inquiries" ON public.contact_inquiries
    FOR UPDATE TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin delete inquiries" ON public.contact_inquiries
    FOR DELETE TO authenticated USING (public.is_admin());

-- Agents Policies
DROP POLICY IF EXISTS "Public view agents" ON public.agents;
CREATE POLICY "Public view agents" ON public.agents
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage agents" ON public.agents;
CREATE POLICY "Admin manage agents" ON public.agents
    FOR ALL TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Services Policies
DROP POLICY IF EXISTS "Public view services" ON public.services;
CREATE POLICY "Public view services" ON public.services
    FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage services" ON public.services;
CREATE POLICY "Admin manage services" ON public.services
    FOR ALL TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Testimonials Policies
DROP POLICY IF EXISTS "Public view testimonials" ON public.testimonials;
CREATE POLICY "Public view testimonials" ON public.testimonials
    FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage testimonials" ON public.testimonials;
CREATE POLICY "Admin manage testimonials" ON public.testimonials
    FOR ALL TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Settings Policies
DROP POLICY IF EXISTS "Public view settings" ON public.site_settings;
CREATE POLICY "Public view settings" ON public.site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage settings" ON public.site_settings;
CREATE POLICY "Admin manage settings" ON public.site_settings
    FOR ALL TO authenticated USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Analytics Policies
DROP POLICY IF EXISTS "Public insert analytics" ON public.analytics_events;
CREATE POLICY "Public insert analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view analytics" ON public.analytics_events;
CREATE POLICY "Admin view analytics" ON public.analytics_events
    FOR SELECT TO authenticated USING (public.is_admin());

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET & POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Property Images" ON storage.objects;
CREATE POLICY "Public Read Property Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admin Upload Property Images" ON storage.objects;
CREATE POLICY "Admin Upload Property Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Update Property Images" ON storage.objects;
CREATE POLICY "Admin Update Property Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Property Images" ON storage.objects;
CREATE POLICY "Admin Delete Property Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND public.is_admin());

