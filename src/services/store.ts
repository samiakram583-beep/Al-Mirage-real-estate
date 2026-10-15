import {
  INITIAL_POPULAR_AREAS,
  INITIAL_SETTINGS,
} from '../data/seedData';
import { ADMIN_AUTHORIZED_EMAIL, isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Agent,
  AnalyticsEvent,
  AreaUnit,
  Inquiry,
  InquiryNote,
  LocationArea,
  Property,
  PropertyFilterParams,
  PropertyImage,
  PropertyStatus,
  PropertyType,
  PurposeType,
  RealEstateService,
  SiteSettings,
  Testimonial,
} from '../types';

const STORAGE_KEYS = {
  PROPERTIES: 'bahria_realestate_properties_live',
  AGENTS: 'bahria_realestate_agents_live',
  INQUIRIES: 'bahria_realestate_inquiries_live',
  SETTINGS: 'bahria_realestate_settings_live',
  LOCATIONS: 'bahria_realestate_locations_live',
  SERVICES: 'bahria_realestate_services_live',
  TESTIMONIALS: 'bahria_realestate_testimonials_live',
  ANALYTICS_EVENTS: 'bahria_realestate_events_live',
};

export function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

export function resolvePublicImageUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
  const trimmed = pathOrUrl.trim();
  if (!trimmed || trimmed.startsWith('blob:')) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  // If it's a Supabase storage path or relative path
  if (isSupabaseConfigured) {
    const cleanPath = trimmed.replace(/^property-images\//, '');
    const { data } = supabase.storage.from('property-images').getPublicUrl(cleanPath);
    return data?.publicUrl || '';
  }
  return '';
}

/**
 * Uploads a property image to Supabase Storage in bucket 'property-images'.
 * If the bucket is not available or offline, falls back to an optimized,
 * persistent Data URL so images never break on refresh or across devices.
 */
export async function uploadPropertyImage(file: File): Promise<{ url: string; path: string }> {
  if (!file) throw new Error('No file provided for upload.');

  // 1. If Supabase is configured, attempt upload to Supabase Storage
  if (isSupabaseConfigured) {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanName}`;
      const filePath = uniqueFileName;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (!error && data) {
        const { data: pubData } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);

        if (pubData?.publicUrl) {
          return {
            url: pubData.publicUrl,
            path: data.path,
          };
        }
      } else if (error) {
        console.warn('Supabase storage upload notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // 2. Persistent fallback (never produce dead blob: URLs)
  // Convert to high-quality compressed Data URL that survives page refreshes and persists in Postgres/JSON
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = (e.target?.result as string) || '';
      // If image is reasonably sized, return directly
      if (file.size < 800 * 1024) {
        resolve({ url: rawResult, path: file.name });
        return;
      }
      // Compress larger images via canvas to keep persistent storage lean
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve({
            url: canvas.toDataURL('image/jpeg', 0.85),
            path: file.name,
          });
          return;
        }
        resolve({ url: rawResult, path: file.name });
      };
      img.onerror = () => resolve({ url: rawResult, path: file.name });
      img.src = rawResult;
    };
    reader.onerror = () => resolve({ url: '', path: file.name });
    reader.readAsDataURL(file);
  });
}

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Convert DB row from Supabase into our frontend Property model
function mapDbPropertyToProperty(row: any): Property {
  const rawCover =
    row.cover_image ||
    row.image_url ||
    row.image ||
    row.thumbnail ||
    row.main_image ||
    '';
  const cleanCoverImage = resolvePublicImageUrl(rawCover);

  let rawImagesList: any[] = [];
  const rawImagesField = row.images ?? row.photos ?? row.gallery;
  if (Array.isArray(rawImagesField)) {
    rawImagesList = rawImagesField;
  } else if (typeof rawImagesField === 'string') {
    try {
      const parsed = JSON.parse(rawImagesField);
      if (Array.isArray(parsed)) rawImagesList = parsed;
    } catch {
      if (
        rawImagesField.startsWith('http') ||
        rawImagesField.startsWith('data:') ||
        rawImagesField.includes('/')
      ) {
        rawImagesList = [rawImagesField];
      }
    }
  }

  const images: PropertyImage[] = rawImagesList
    .map((img: any, idx: number) => {
      if (typeof img === 'string') {
        const url = resolvePublicImageUrl(img);
        if (!url) return null;
        return {
          id: `img-${row.id}-${idx}`,
          property_id: row.id,
          storage_path: img,
          public_url: url,
          sort_order: idx + 1,
          is_primary: idx === 0,
        };
      }
      if (img && (typeof img.public_url === 'string' || typeof img.storage_path === 'string')) {
        const url = resolvePublicImageUrl(img.public_url || img.storage_path);
        if (!url) return null;
        return {
          ...img,
          id: img.id || `img-${row.id}-${idx}`,
          property_id: row.id,
          public_url: url,
        };
      }
      return null;
    })
    .filter((img): img is PropertyImage => img !== null);

  if (images.length === 0 && cleanCoverImage) {
    images.push({
      id: `img-${row.id}-0`,
      property_id: row.id,
      storage_path: cleanCoverImage,
      public_url: cleanCoverImage,
      sort_order: 1,
      is_primary: true,
    });
  }

  const rawStatus = (row.status || '').toLowerCase();
  const status: PropertyStatus =
    rawStatus === 'draft'
      ? 'Draft'
      : rawStatus === 'sold'
      ? 'Sold'
      : rawStatus === 'rented'
      ? 'Rented'
      : rawStatus === 'under offer'
      ? 'Under Offer'
      : 'Available';

  const isPublished =
    row.is_published !== undefined
      ? Boolean(row.is_published)
      : rawStatus === 'published' || rawStatus === 'available';

  const areaValue =
    Number(row.area_value) ||
    (typeof row.area === 'number'
      ? row.area
      : parseFloat(String(row.area || '10')) || 10);

  return {
    id: row.id,
    property_code: row.property_code || `PB-${String(row.id).slice(0, 4).toUpperCase()}`,
    title: row.title || 'Property in Bahria Town / Orchard',
    slug: row.slug,
    description: row.description || '',
    purpose: (row.purpose || row.listing_type || 'Sale') as PurposeType,
    property_type: (row.property_type || 'House') as PropertyType,
    status,
    price: Number(row.price) || 0,
    currency: row.currency || 'PKR',
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    parking_spaces: Number(row.parking_spaces) || 0,
    floors: Number(row.floors) || 1,
    is_furnished: Boolean(row.is_furnished),
    area_value: areaValue,
    area_unit: (row.area_unit || 'Marla') as AreaUnit,
    province: row.province || 'Punjab',
    city: row.city || 'Lahore',
    area: row.area || row.location || 'Bahria Town Lahore',
    society: row.society || 'Bahria Town Lahore',
    block: row.block || '',
    address: row.address || row.location || 'Bahria Town / Orchard Lahore',
    latitude: Number(row.latitude) || 31.3687,
    longitude: Number(row.longitude) || 74.1782,
    agent_id: row.agent_id || '',
    is_featured: Boolean(row.is_featured ?? row.featured),
    is_published: isPublished,
    views_count: Number(row.views_count) || 0,
    features: Array.isArray(row.features) ? row.features : [],
    cover_image: cleanCoverImage || (images[0]?.public_url || ''),
    images,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
    seo_title: row.seo_title || row.title,
    seo_description: row.seo_description || (row.description ? row.description.slice(0, 150) : ''),
  };
}

// Convert DB row to Inquiry model
function mapDbInquiryToInquiry(row: any): Inquiry {
  const rawStatus = (row.status || 'new').toLowerCase();
  const status: Inquiry['status'] =
    rawStatus === 'contacted'
      ? 'Contacted'
      : rawStatus === 'qualified'
      ? 'Qualified'
      : rawStatus === 'viewing scheduled'
      ? 'Viewing Scheduled'
      : rawStatus === 'negotiation'
      ? 'Negotiation'
      : rawStatus === 'closed'
      ? 'Closed'
      : rawStatus === 'lost'
      ? 'Lost'
      : 'New';

  return {
    id: row.id,
    property_id: row.property_id || '',
    property_code: row.property_code || '',
    property_title: row.property_title || '',
    agent_id: row.agent_id || '',
    agent_name: row.agent_name || 'Agency Desk',
    name: row.name || 'Anonymous',
    phone: row.phone || '',
    email: row.email || '',
    message: row.message || '',
    status,
    source: (row.source || 'website') as Inquiry['source'],
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
    notes: Array.isArray(row.notes) ? row.notes : [],
  };
}

// =============================================================
// SUPABASE HEALTH & SCHEMA CHECK
// =============================================================
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  tablesFound: {
    properties: boolean;
    inquiries: boolean;
    agents: boolean;
    services: boolean;
    testimonials: boolean;
    settings: boolean;
  };
  error?: string;
}> {
  const tablesFound = {
    properties: false,
    inquiries: false,
    agents: false,
    services: false,
    testimonials: false,
    settings: false,
  };

  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      tablesFound,
      error: 'Supabase URL or Publishable Key is not configured.',
    };
  }

  try {
    const [pRes, iRes, aRes, sRes, tRes, setRes] = await Promise.allSettled([
      supabase.from('properties').select('id').limit(1),
      supabase.from('contact_inquiries').select('id').limit(1),
      supabase.from('agents').select('id').limit(1),
      supabase.from('services').select('id').limit(1),
      supabase.from('testimonials').select('id').limit(1),
      supabase.from('site_settings').select('id').limit(1),
    ]);

    tablesFound.properties = pRes.status === 'fulfilled' && !pRes.value.error;
    tablesFound.inquiries = iRes.status === 'fulfilled' && !iRes.value.error;
    tablesFound.agents = aRes.status === 'fulfilled' && !aRes.value.error;
    tablesFound.services = sRes.status === 'fulfilled' && !sRes.value.error;
    tablesFound.testimonials = tRes.status === 'fulfilled' && !tRes.value.error;
    tablesFound.settings = setRes.status === 'fulfilled' && !setRes.value.error;

    const anyConnected = Object.values(tablesFound).some(Boolean);
    return {
      configured: true,
      connected: anyConnected,
      tablesFound,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      tablesFound,
      error: err.message || 'Connection check failed.',
    };
  }
}

// =============================================================
// 1. PROPERTIES (SUPABASE SINGLE SOURCE OF TRUTH)
// =============================================================
export async function getProperties(params?: PropertyFilterParams): Promise<{
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}> {
  let list: Property[] = [];
  let fetchedFromDb = false;

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('properties').select('*', { count: 'exact' });

      // Only published/available properties for public visitors unless specified
      if (params?.purpose) {
        query = query.or(`purpose.eq.${params.purpose},listing_type.eq.${params.purpose}`);
      }
      if (params?.property_type && params.property_type !== 'All') {
        query = query.eq('property_type', params.property_type);
      }
      if (params?.featured) {
        query = query.or('is_featured.eq.true,featured.eq.true');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        list = data.map(mapDbPropertyToProperty);
        setLocalItem(STORAGE_KEYS.PROPERTIES, list);
        fetchedFromDb = true;
      } else if (error) {
        console.warn('Supabase properties query notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch exception, falling back to local cache:', err);
    }
  }

  if (!fetchedFromDb) {
    list = getLocalItem<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  }

  // Client-side filtering
  if (params?.purpose) {
    list = list.filter((p) => p.purpose === params.purpose);
  }
  if (params?.property_type && params.property_type !== 'All') {
    list = list.filter((p) => p.property_type === params.property_type);
  }
  if (params?.city && params.city !== 'All') {
    list = list.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
  }
  if (params?.area && params.area !== 'All') {
    list = list.filter((p) =>
      p.area.toLowerCase().includes(params.area!.toLowerCase())
    );
  }
  if (params?.society) {
    list = list.filter((p) =>
      (p.society || '').toLowerCase().includes(params.society!.toLowerCase())
    );
  }
  if (params?.min_price) {
    list = list.filter((p) => p.price >= params.min_price!);
  }
  if (params?.max_price) {
    list = list.filter((p) => p.price <= params.max_price!);
  }
  if (params?.bedrooms && params.bedrooms !== 'Any') {
    const minBeds = Number(params.bedrooms);
    list = list.filter((p) => p.bedrooms >= minBeds);
  }
  if (params?.bathrooms && params.bathrooms !== 'Any') {
    const minBaths = Number(params.bathrooms);
    list = list.filter((p) => p.bathrooms >= minBaths);
  }
  if (params?.featured) {
    list = list.filter((p) => p.is_featured);
  }
  if (params?.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.property_code.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        (p.society || '').toLowerCase().includes(q) ||
        (p.block || '').toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (params?.sort_by === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (params?.sort_by === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (params?.sort_by === 'area_desc') {
    list.sort((a, b) => b.area_value - a.area_value);
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const page = params?.page || 1;
  const limit = params?.limit || 9;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    properties: paginated,
    total,
    page,
    totalPages,
  };
}

export async function getPropertyBySlugOrId(identifier: string): Promise<Property | null> {
  if (isSupabaseConfigured) {
    try {
      const isUuid = isValidUuid(identifier);
      let query = supabase.from('properties').select('*');

      if (isUuid) {
        query = query.or(`id.eq.${identifier},slug.eq.${identifier}`);
      } else {
        query = query.or(`slug.eq.${identifier},property_code.eq.${identifier}`);
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return mapDbPropertyToProperty(data);
      }
    } catch (e) {
      console.warn('Property lookup error:', e);
    }
  }

  const list = getLocalItem<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  const found = list.find(
    (p) =>
      p.slug === identifier ||
      p.id === identifier ||
      p.property_code.toLowerCase() === identifier.toLowerCase()
  );
  return found || null;
}

export async function saveProperty(property: Partial<Property>): Promise<Property> {
  const isExisting = Boolean(property.id && isValidUuid(property.id));
  const now = new Date().toISOString();

  const sanitizeUrl = (url?: string | null): string => {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:')) return '';
    return url.trim();
  };

  // Extract clean cover image and array of permanent image URLs
  const imageUrls: string[] = Array.isArray(property.images)
    ? property.images
        .map((img: any) =>
          typeof img === 'string' ? sanitizeUrl(img) : sanitizeUrl(img?.public_url || img?.storage_path)
        )
        .filter((url): url is string => Boolean(url))
    : [];

  const coverImage =
    sanitizeUrl(property.cover_image) ||
    imageUrls[0] ||
    '';

  const statusStr =
    property.is_published === false || property.status === 'Draft'
      ? 'draft'
      : property.status === 'Sold'
      ? 'sold'
      : property.status === 'Rented'
      ? 'rented'
      : 'published';

  const validAgentId = isValidUuid(property.agent_id) ? property.agent_id : null;

  const dbPayload: any = {
    title: property.title?.trim() || 'Untitled Property',
    slug:
      property.slug?.trim() ||
      `prop-${Date.now()}-${(property.title || 'listing').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    description: property.description?.trim() || '',
    property_type: property.property_type || 'House',
    listing_type: property.purpose || 'Sale',
    purpose: property.purpose || 'Sale',
    price: Number(property.price) || 0,
    location: property.address || property.area || 'Bahria Town Lahore',
    area: `${property.area_value || 10} ${property.area_unit || 'Marla'}`,
    area_value: Number(property.area_value) || 10,
    area_unit: property.area_unit || 'Marla',
    bedrooms: Number(property.bedrooms) || 0,
    bathrooms: Number(property.bathrooms) || 0,
    parking_spaces: Number(property.parking_spaces) || 0,
    cover_image: coverImage,
    images: imageUrls,
    status: statusStr,
    featured: Boolean(property.is_featured),
    is_featured: Boolean(property.is_featured),
    is_published: statusStr === 'published',
    city: property.city || 'Lahore',
    province: property.province || 'Punjab',
    society: property.society || 'Bahria Town Lahore',
    block: property.block || '',
    address: property.address || '',
    agent_id: validAgentId,
    property_code: property.property_code || `PB-${Math.floor(1000 + Math.random() * 9000)}`,
    updated_at: now,
  };

  if (isExisting) {
    dbPayload.id = property.id;
  }

  let savedRecord: Property | null = null;

  if (isSupabaseConfigured) {
    try {
      if (isExisting) {
        const { data, error } = await supabase
          .from('properties')
          .update(dbPayload)
          .eq('id', property.id)
          .select()
          .single();

        if (error) {
          console.warn('Supabase update notice:', error.message);
        } else if (data) {
          savedRecord = mapDbPropertyToProperty(data);
        }
      } else {
        const { data, error } = await supabase
          .from('properties')
          .insert([dbPayload])
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert notice:', error.message);
        } else if (data) {
          savedRecord = mapDbPropertyToProperty(data);
        }
      }
    } catch (err: any) {
      console.warn('Supabase property write exception:', err);
    }
  }

  // Fallback / local cache sync
  if (!savedRecord) {
    savedRecord = {
      ...mapDbPropertyToProperty(dbPayload),
      id: property.id || `prop-${Date.now()}`,
    };
  }

  // Update local cache
  const list = getLocalItem<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  const existingIdx = list.findIndex((p) => p.id === savedRecord!.id);
  if (existingIdx >= 0) {
    list[existingIdx] = savedRecord;
  } else {
    list.unshift(savedRecord);
  }
  setLocalItem(STORAGE_KEYS.PROPERTIES, list);

  return savedRecord;
}

export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  if (!id) {
    return { success: false, error: 'Property ID is required for deletion.' };
  }

  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      // 1. Unlink any contact_inquiries referencing this property to satisfy foreign key constraints
      try {
        await supabase
          .from('contact_inquiries')
          .update({ property_id: null })
          .eq('property_id', id);
      } catch {
        // Non-blocking if table or column doesn't exist
      }

      // 2. Unlink any analytics_events referencing this property
      try {
        await supabase
          .from('analytics_events')
          .update({ property_id: null })
          .eq('property_id', id);
      } catch {
        // Non-blocking
      }

      // 3. Delete from Supabase properties table
      const { data, error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) {
        console.error('Supabase property deletion error:', error.message);
        return {
          success: false,
          error: error.message || 'Failed to delete property from database.',
        };
      }

      // If PostgREST returned 200/204 but zero rows were deleted:
      // Verify whether the property was actually in the database and blocked by RLS policies
      if (!data || data.length === 0) {
        const { count, error: countErr } = await supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('id', id);

        if (!countErr && count && count > 0) {
          return {
            success: false,
            error:
              'Database permission error: Deletion blocked by Row Level Security (RLS). You must be signed in as the authorized administrator (sa3840213@gmail.com).',
          };
        }
      }
    } catch (e: any) {
      console.error('Database deletion exception:', e);
      return {
        success: false,
        error: e.message || 'An unexpected error occurred while deleting property.',
      };
    }
  }

  // Remove from local storage cache
  const list = getLocalItem<Property[]>(STORAGE_KEYS.PROPERTIES, []);
  const filtered = list.filter((p) => p.id !== id);
  setLocalItem(STORAGE_KEYS.PROPERTIES, filtered);

  return { success: true };
}

export async function duplicateProperty(id: string): Promise<Property | null> {
  const existing = await getPropertyBySlugOrId(id);
  if (!existing) return null;

  const clone: Partial<Property> = {
    ...existing,
    id: undefined,
    property_code: `PB-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `${existing.title} (Copy)`,
    slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
    status: 'Draft',
    is_published: false,
    views_count: 0,
    created_at: new Date().toISOString(),
  };

  return await saveProperty(clone);
}

// =============================================================
// 2. CONTACT INQUIRIES (SUPABASE contact_inquiries)
// =============================================================
export async function getInquiries(): Promise<Inquiry[]> {
  let inquiries: Inquiry[] = [];
  let fetchedFromDb = false;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        inquiries = data.map(mapDbInquiryToInquiry);
        setLocalItem(STORAGE_KEYS.INQUIRIES, inquiries);
        fetchedFromDb = true;
      } else if (error) {
        console.warn('Supabase contact_inquiries fetch notice:', error.message);
      }
    } catch (e) {
      console.warn('Inquiries fetch exception:', e);
    }
  }

  if (!fetchedFromDb) {
    inquiries = getLocalItem<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
  }

  return inquiries;
}

export async function submitInquiry(data: {
  property_id?: string | null;
  property_code?: string;
  property_title?: string;
  agent_id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  source?: Inquiry['source'];
}): Promise<Inquiry> {
  const now = new Date().toISOString();
  const validPropertyId = isValidUuid(data.property_id) ? data.property_id : null;

  const dbPayload: any = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || null,
    message: data.message.trim(),
    property_id: validPropertyId,
    property_code: data.property_code || null,
    property_title: data.property_title || null,
    status: 'new',
    source: data.source || 'website',
    notes: [],
  };

  let savedInquiry: Inquiry | null = null;

  if (isSupabaseConfigured) {
    try {
      const { data: inserted, error } = await supabase
        .from('contact_inquiries')
        .insert([dbPayload])
        .select()
        .single();

      if (!error && inserted) {
        savedInquiry = mapDbInquiryToInquiry(inserted);
      } else if (error) {
        console.warn('Supabase inquiry insert notice:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase contact inquiry insertion notice:', err);
    }
  }

  if (!savedInquiry) {
    savedInquiry = {
      id: `inq-${Date.now()}`,
      property_id: validPropertyId || '',
      property_code: data.property_code || '',
      property_title: data.property_title || '',
      agent_id: data.agent_id || '',
      agent_name: 'Agency Desk',
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || '',
      message: data.message.trim(),
      status: 'New',
      source: data.source || 'website',
      created_at: now,
      updated_at: now,
      notes: [],
    };
  }

  // Update local cache
  const list = getLocalItem<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
  list.unshift(savedInquiry);
  setLocalItem(STORAGE_KEYS.INQUIRIES, list);

  // Record analytics telemetry
  recordAnalyticsEvent({
    event_type: 'inquiry_submitted',
    property_id: validPropertyId || undefined,
    source: data.source || 'website',
  }).catch(() => {});

  return savedInquiry;
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<boolean> {
  const normalizedStatus = status.toLowerCase();

  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status: normalizedStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.warn('Supabase inquiry status update error:', error.message);
      }
    } catch (e: any) {
      console.warn('Update inquiry status error:', e);
    }
  }

  const list = getLocalItem<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
  const item = list.find((i) => i.id === id);
  if (item) {
    item.status = status;
    item.updated_at = new Date().toISOString();
    setLocalItem(STORAGE_KEYS.INQUIRIES, list);
    return true;
  }
  return false;
}

export async function addInquiryNote(
  inquiry_id: string,
  noteText: string,
  authorName = 'Admin'
): Promise<InquiryNote> {
  const newNote: InquiryNote = {
    id: `note-${Date.now()}`,
    inquiry_id,
    author_name: authorName,
    note: noteText,
    created_at: new Date().toISOString(),
  };

  const list = getLocalItem<Inquiry[]>(STORAGE_KEYS.INQUIRIES, []);
  const inq = list.find((i) => i.id === inquiry_id);
  if (inq) {
    if (!inq.notes) inq.notes = [];
    inq.notes.unshift(newNote);
    setLocalItem(STORAGE_KEYS.INQUIRIES, list);

    if (isSupabaseConfigured && isValidUuid(inquiry_id)) {
      try {
        await supabase
          .from('contact_inquiries')
          .update({ notes: inq.notes, updated_at: new Date().toISOString() })
          .eq('id', inquiry_id);
      } catch {
        // ignore
      }
    }
  }

  return newNote;
}

// =============================================================
// 3. CONSULTANTS / AGENTS
// =============================================================
export async function getAgents(): Promise<Agent[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setLocalItem(STORAGE_KEYS.AGENTS, data as Agent[]);
        return data as Agent[];
      }
    } catch (e) {
      console.warn('Supabase agents error:', e);
    }
  }
  return getLocalItem<Agent[]>(STORAGE_KEYS.AGENTS, []);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const agents = await getAgents();
  return agents.find((a) => a.id === id) || null;
}

export async function saveAgent(agent: Partial<Agent>): Promise<Agent> {
  const now = new Date().toISOString();
  const dbPayload = {
    name: agent.name?.trim() || '',
    email: agent.email?.trim() || '',
    phone: agent.phone?.trim() || '+92 324 4101140',
    whatsapp: agent.whatsapp?.trim() || '+92 324 4101140',
    avatar_url: agent.avatar_url || '',
    title: agent.title?.trim() || 'Senior Consultant',
    agency_name: 'Real Estate In Bahria Town / Orchard Lahore',
    license_number: agent.license_number || '',
    bio: agent.bio?.trim() || '',
    experience_years: Number(agent.experience_years) || 5,
    areas_served: agent.areas_served || ['Bahria Town Lahore', 'Bahria Orchard'],
    is_active: agent.is_active !== false,
    is_featured: Boolean(agent.is_featured),
    updated_at: now,
  };

  if (isSupabaseConfigured) {
    try {
      if (agent.id && isValidUuid(agent.id)) {
        const { data, error } = await supabase
          .from('agents')
          .update(dbPayload)
          .eq('id', agent.id)
          .select()
          .single();
        if (!error && data) return data as Agent;
      } else {
        const { data, error } = await supabase
          .from('agents')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) return data as Agent;
      }
    } catch (e) {
      console.error('Save agent error:', e);
    }
  }

  const localAgent: Agent = {
    id: agent.id || `agent-${Date.now()}`,
    ...dbPayload,
    created_at: agent.created_at || now,
  };

  const list = getLocalItem<Agent[]>(STORAGE_KEYS.AGENTS, []);
  const idx = list.findIndex((a) => a.id === localAgent.id);
  if (idx >= 0) list[idx] = localAgent;
  else list.unshift(localAgent);
  setLocalItem(STORAGE_KEYS.AGENTS, list);
  return localAgent;
}

export async function deleteAgent(id: string): Promise<boolean> {
  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      await supabase.from('agents').delete().eq('id', id);
    } catch (e) {
      console.warn('Delete agent error:', e);
    }
  }

  const list = getLocalItem<Agent[]>(STORAGE_KEYS.AGENTS, []);
  const filtered = list.filter((a) => a.id !== id);
  setLocalItem(STORAGE_KEYS.AGENTS, filtered);
  return true;
}

// =============================================================
// 4. TESTIMONIALS
// =============================================================
export async function getTestimonials(): Promise<Testimonial[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLocalItem(STORAGE_KEYS.TESTIMONIALS, data as Testimonial[]);
        return data as Testimonial[];
      }
    } catch (e) {
      console.warn('Supabase testimonials query error:', e);
    }
  }
  return getLocalItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, []);
}

export async function saveTestimonial(testimonial: Partial<Testimonial>): Promise<Testimonial> {
  const now = new Date().toISOString();
  const dbPayload = {
    name: testimonial.name?.trim() || '',
    location: testimonial.location?.trim() || 'Bahria Town Lahore',
    role: testimonial.role?.trim() || 'Client',
    avatar_url: testimonial.avatar_url || '',
    rating: Number(testimonial.rating) || 5,
    comment: testimonial.comment?.trim() || '',
    property_type: testimonial.property_type || '',
    is_published: testimonial.is_published !== false,
  };

  if (isSupabaseConfigured) {
    try {
      if (testimonial.id && isValidUuid(testimonial.id)) {
        const { data, error } = await supabase
          .from('testimonials')
          .update(dbPayload)
          .eq('id', testimonial.id)
          .select()
          .single();
        if (!error && data) return data as Testimonial;
      } else {
        const { data, error } = await supabase
          .from('testimonials')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) return data as Testimonial;
      }
    } catch (e) {
      console.warn('Save testimonial error:', e);
    }
  }

  const localItem: Testimonial = {
    id: testimonial.id || `test-${Date.now()}`,
    ...dbPayload,
    created_at: testimonial.created_at || now,
  };

  const list = getLocalItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, []);
  const idx = list.findIndex((t) => t.id === localItem.id);
  if (idx >= 0) list[idx] = localItem;
  else list.unshift(localItem);
  setLocalItem(STORAGE_KEYS.TESTIMONIALS, list);
  return localItem;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      await supabase.from('testimonials').delete().eq('id', id);
    } catch (e) {
      console.warn('Delete testimonial error:', e);
    }
  }

  const list = getLocalItem<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, []);
  const filtered = list.filter((t) => t.id !== id);
  setLocalItem(STORAGE_KEYS.TESTIMONIALS, filtered);
  return true;
}

// =============================================================
// 5. SERVICES
// =============================================================
export async function getServices(): Promise<RealEstateService[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');

      if (!error && data) {
        setLocalItem(STORAGE_KEYS.SERVICES, data as RealEstateService[]);
        return data as RealEstateService[];
      }
    } catch (e) {
      console.warn('Supabase services query error:', e);
    }
  }
  return getLocalItem<RealEstateService[]>(STORAGE_KEYS.SERVICES, []);
}

export async function saveService(service: Partial<RealEstateService>): Promise<RealEstateService> {
  const now = new Date().toISOString();
  const dbPayload = {
    title: service.title?.trim() || '',
    slug: service.slug?.trim() || `service-${Date.now()}`,
    short_description: service.short_description?.trim() || '',
    full_description: service.full_description?.trim() || '',
    icon_name: service.icon_name || 'Home',
    benefits: service.benefits || [],
    sort_order: Number(service.sort_order) || 0,
    is_published: service.is_published !== false,
  };

  if (isSupabaseConfigured) {
    try {
      if (service.id && isValidUuid(service.id)) {
        const { data, error } = await supabase
          .from('services')
          .update(dbPayload)
          .eq('id', service.id)
          .select()
          .single();
        if (!error && data) return data as RealEstateService;
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert([dbPayload])
          .select()
          .single();
        if (!error && data) return data as RealEstateService;
      }
    } catch (e) {
      console.warn('Save service error:', e);
    }
  }

  const localItem: RealEstateService = {
    id: service.id || `serv-${Date.now()}`,
    ...dbPayload,
  };

  const list = getLocalItem<RealEstateService[]>(STORAGE_KEYS.SERVICES, []);
  const idx = list.findIndex((s) => s.id === localItem.id);
  if (idx >= 0) list[idx] = localItem;
  else list.unshift(localItem);
  setLocalItem(STORAGE_KEYS.SERVICES, list);
  return localItem;
}

export async function deleteService(id: string): Promise<boolean> {
  if (isSupabaseConfigured && isValidUuid(id)) {
    try {
      await supabase.from('services').delete().eq('id', id);
    } catch (e) {
      console.warn('Delete service error:', e);
    }
  }

  const list = getLocalItem<RealEstateService[]>(STORAGE_KEYS.SERVICES, []);
  const filtered = list.filter((s) => s.id !== id);
  setLocalItem(STORAGE_KEYS.SERVICES, filtered);
  return true;
}

// =============================================================
// 6. SITE SETTINGS
// =============================================================
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        const merged = {
          ...INITIAL_SETTINGS,
          ...data,
        };
        setLocalItem(STORAGE_KEYS.SETTINGS, merged);
        return merged;
      }
    } catch (e) {
      console.warn('Supabase site settings error:', e);
    }
  }
  return getLocalItem<SiteSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated = { ...current, ...settings };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('site_settings').upsert({
        id: 1,
        ...updated,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase update site settings error:', e);
    }
  }

  setLocalItem(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

// =============================================================
// 7. LOCATIONS
// =============================================================
export async function getPopularAreas(): Promise<LocationArea[]> {
  return INITIAL_POPULAR_AREAS;
}

export async function getAreaBySlug(slug: string): Promise<LocationArea | null> {
  const areas = await getPopularAreas();
  return areas.find((a) => a.slug === slug) || null;
}

// =============================================================
// 8. TELEMETRY & ANALYTICS (REAL DATABASE EVENTS)
// =============================================================
export async function recordAnalyticsEvent(
  eventData: Omit<AnalyticsEvent, 'id' | 'created_at'>
): Promise<AnalyticsEvent> {
  const newEvent: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    ...eventData,
  };

  const list = getLocalItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS_EVENTS, []);
  list.unshift(newEvent);
  if (list.length > 2000) list.length = 2000;
  setLocalItem(STORAGE_KEYS.ANALYTICS_EVENTS, list);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('analytics_events').insert([
        {
          event_type: eventData.event_type,
          property_id: isValidUuid(eventData.property_id) ? eventData.property_id : null,
          society: eventData.society || null,
          source: eventData.source || null,
        },
      ]);
    } catch (e) {
      // ignore telemetry background errors
    }
  }

  return newEvent;
}

export async function recordPropertyView(propertyId: string, society?: string): Promise<void> {
  await recordAnalyticsEvent({
    event_type: 'property_view',
    property_id: propertyId,
    society,
    source: 'property_detail',
  });
}

export async function recordWhatsAppClick(
  propertyId?: string,
  agentId?: string,
  society?: string,
  source = 'whatsapp_cta'
): Promise<void> {
  await recordAnalyticsEvent({
    event_type: 'whatsapp_click',
    property_id: propertyId,
    agent_id: agentId,
    society,
    source,
  });
}

export async function recordPhoneClick(
  propertyId?: string,
  agentId?: string,
  source = 'phone_cta'
): Promise<void> {
  await recordAnalyticsEvent({
    event_type: 'phone_click',
    property_id: propertyId,
    agent_id: agentId,
    source,
  });
}

export async function recordFavoriteEvent(propertyId: string): Promise<void> {
  await recordAnalyticsEvent({
    event_type: 'favorite_added',
    property_id: propertyId,
    source: 'card_favorite',
  });
}

// =============================================================
// 9. GENUINE BUSINESS ANALYTICS CALCULATION
// =============================================================
export interface AnalyticsSummaryResult {
  totalViews: number;
  viewsTrend: { value: string; positive: boolean } | null;
  totalInquiries: number;
  inquiriesTrend: { value: string; positive: boolean } | null;
  whatsappClicks: number;
  whatsappTrend: { value: string; positive: boolean } | null;
  phoneClicks: number;
  favoriteSaves: number;
  topSocieties: { name: string; views: number; share: string }[];
  sourceBreakdown: { source: string; count: number; percent: number; color: string }[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummaryResult> {
  const [inqs, events] = await Promise.all([
    getInquiries(),
    getLocalItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS_EVENTS, []),
  ]);

  const viewEvents = events.filter((e) => e.event_type === 'property_view');
  const whatsappEvents = events.filter((e) => e.event_type === 'whatsapp_click');
  const phoneEvents = events.filter((e) => e.event_type === 'phone_click');
  const favoriteEvents = events.filter((e) => e.event_type === 'favorite_added');

  const totalViews = viewEvents.length;
  const whatsappClicks = whatsappEvents.length;
  const phoneClicks = phoneEvents.length;
  const favoriteSaves = favoriteEvents.length;
  const totalInquiries = inqs.length;

  // Real MoM trend calculations
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const sixtyDays = 60 * 24 * 60 * 60 * 1000;

  const viewsCurr = viewEvents.filter((e) => now - new Date(e.created_at).getTime() <= thirtyDays).length;
  const viewsPrev = viewEvents.filter((e) => {
    const t = now - new Date(e.created_at).getTime();
    return t > thirtyDays && t <= sixtyDays;
  }).length;
  const viewsTrendVal = calculateMoMTrend(viewsCurr, viewsPrev);

  const inqsCurr = inqs.filter((e) => now - new Date(e.created_at).getTime() <= thirtyDays).length;
  const inqsPrev = inqs.filter((e) => {
    const t = now - new Date(e.created_at).getTime();
    return t > thirtyDays && t <= sixtyDays;
  }).length;
  const inqsTrendVal = calculateMoMTrend(inqsCurr, inqsPrev);

  const waCurr = whatsappEvents.filter((e) => now - new Date(e.created_at).getTime() <= thirtyDays).length;
  const waPrev = whatsappEvents.filter((e) => {
    const t = now - new Date(e.created_at).getTime();
    return t > thirtyDays && t <= sixtyDays;
  }).length;
  const waTrendVal = calculateMoMTrend(waCurr, waPrev);

  // Group top societies by views
  const societyCounts: Record<string, number> = {};
  viewEvents.forEach((v) => {
    const s = v.society || 'Bahria Town Lahore';
    societyCounts[s] = (societyCounts[s] || 0) + 1;
  });

  const sortedSocieties = Object.entries(societyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topSocieties = sortedSocieties.map(([name, count]) => ({
    name,
    views: count,
    share: totalViews > 0 ? `${Math.round((count / totalViews) * 100)}%` : '0%',
  }));

  // Source breakdown based on actual inquiries
  const sourceCounts: Record<string, number> = {};
  inqs.forEach((i) => {
    const src = i.source === 'whatsapp' ? 'WhatsApp' : i.source === 'phone' ? 'Phone Call' : 'Website Form';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const sourceColors: Record<string, string> = {
    'Website Form': 'bg-[#173C32]',
    'WhatsApp': 'bg-emerald-500',
    'Phone Call': 'bg-blue-500',
  };

  const sourceBreakdown = Object.entries(sourceCounts).map(([src, count]) => ({
    source: src,
    count,
    percent: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
    color: sourceColors[src] || 'bg-[#B89B5E]',
  }));

  return {
    totalViews,
    viewsTrend: viewsTrendVal !== null ? { value: `${Math.abs(viewsTrendVal)}%`, positive: viewsTrendVal >= 0 } : null,
    totalInquiries,
    inquiriesTrend: inqsTrendVal !== null ? { value: `${Math.abs(inqsTrendVal)}%`, positive: inqsTrendVal >= 0 } : null,
    whatsappClicks,
    whatsappTrend: waTrendVal !== null ? { value: `${Math.abs(waTrendVal)}%`, positive: waTrendVal >= 0 } : null,
    phoneClicks,
    favoriteSaves,
    topSocieties,
    sourceBreakdown,
  };
}

export interface MonthlyPerformanceRecord {
  month: string;
  inquiries: number;
  listings: number;
  views: number;
}

export async function getMonthlyPerformanceData(): Promise<{
  data: MonthlyPerformanceRecord[];
  hasAnyData: boolean;
}> {
  const [propsRes, inqs, events] = await Promise.all([
    getProperties({ limit: 1000 }),
    getInquiries(),
    getLocalItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS_EVENTS, []),
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const recentMonths = [
    months[(currentMonthIdx - 3 + 12) % 12],
    months[(currentMonthIdx - 2 + 12) % 12],
    months[(currentMonthIdx - 1 + 12) % 12],
    months[currentMonthIdx],
  ];

  const viewsCount = events.filter((e) => e.event_type === 'property_view').length;

  const data: MonthlyPerformanceRecord[] = recentMonths.map((m, idx) => {
    const isCurrent = idx === 3;
    return {
      month: m,
      inquiries: isCurrent ? inqs.length : 0,
      listings: isCurrent ? propsRes.properties.length : 0,
      views: isCurrent ? viewsCount : 0,
    };
  });

  const hasAnyData = inqs.length > 0 || propsRes.properties.length > 0 || viewsCount > 0;
  return { data, hasAnyData };
}

export function calculateMoMTrend(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
