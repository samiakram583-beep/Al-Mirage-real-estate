export type PurposeType = 'Sale' | 'Rent';

export type PropertyType =
  | 'House'
  | 'Apartment'
  | 'Flat'
  | 'Plot'
  | 'Commercial'
  | 'Office'
  | 'Shop'
  | 'Warehouse'
  | 'Farmhouse'
  | 'Building'
  | 'Land'
  | 'Other';

export type AreaUnit = 'Marla' | 'Kanal' | 'Sq. Yds' | 'Sq. Ft' | 'Acre';

export type PropertyStatus =
  | 'Draft'
  | 'Published'
  | 'Active'
  | 'Available'
  | 'Under Offer'
  | 'Sold'
  | 'Rented'
  | 'Archived';

export type InquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Viewing Scheduled'
  | 'Negotiation'
  | 'Closed'
  | 'Lost';

export type InquirySource =
  | 'website'
  | 'whatsapp'
  | 'phone'
  | 'facebook'
  | 'instagram'
  | 'google';

export type UserRole = 'admin' | 'agent' | 'visitor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatar_url: string;
  title: string;
  agency_name?: string;
  license_number?: string;
  bio: string;
  experience_years: number;
  areas_served: string[];
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  properties_count?: number;
  rating?: number;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  public_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface PropertyFeature {
  id?: string;
  property_id?: string;
  category: string; // e.g., 'Utilities', 'Security', 'Recreation', 'Amenities'
  name: string;
}

export interface Property {
  id: string;
  property_code: string; // e.g. "PB-1001"
  title: string;
  slug: string;
  description: string;
  purpose: PurposeType;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number; // in PKR
  currency: string; // 'PKR'
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  floors?: number;
  is_furnished?: boolean;
  area_value: number;
  area_unit: AreaUnit;
  province: string; // e.g. 'Punjab', 'Sindh', 'Islamabad Capital Territory', 'KPK'
  city: string; // e.g. 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'
  area: string; // e.g. 'Bahria Town', 'Bahria Orchard', 'DHA'
  society?: string; // e.g. 'Bahria Town Lahore', 'Bahria Orchard'
  block?: string; // e.g. 'Sector C, Gulbahar Block', 'Phase 1 Eastern'
  address: string;
  latitude?: number;
  longitude?: number;
  agent_id: string;
  agent?: Agent;
  is_featured: boolean;
  is_published: boolean;
  views_count?: number;
  features?: string[];
  cover_image?: string;
  images?: PropertyImage[];
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
}

export interface LocationArea {
  id: string;
  name: string;
  slug: string;
  city: string;
  province: string;
  image_url: string;
  description: string;
  popular_societies: string[];
  properties_count: number;
  average_price_sqft?: number;
}

export interface Inquiry {
  id: string;
  property_id: string;
  property_code?: string;
  property_title?: string;
  agent_id?: string;
  agent_name?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: InquiryStatus;
  source: InquirySource;
  created_at: string;
  updated_at: string;
  notes?: InquiryNote[];
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  role: string;
  avatar_url?: string;
  rating: number;
  comment: string;
  property_type?: string;
  is_published?: boolean;
  created_at: string;
}

export interface RealEstateService {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  icon_name: string;
  benefits: string[];
  is_published?: boolean;
  sort_order?: number;
}

export interface SiteSettings {
  business_name: string;
  tagline: string;
  logo_url: string;
  business_description?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  plus_code?: string;
  google_maps_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url: string;
  business_hours?: string;
  hours_breakdown?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  about_text: string;
  default_currency: string;
  default_city: string;
  seo_defaults: {
    title: string;
    description: string;
    keywords: string;
  };
}

export interface PropertyFilterParams {
  purpose?: PurposeType;
  property_type?: PropertyType | 'All';
  city?: string | 'All';
  area?: string;
  society?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number | 'Any';
  bathrooms?: number | 'Any';
  min_area?: number;
  max_area?: number;
  area_unit?: AreaUnit;
  furnished?: boolean;
  parking?: boolean;
  featured?: boolean;
  query?: string;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
  page?: number;
  limit?: number;
}

export type AnalyticsEventType =
  | 'property_view'
  | 'whatsapp_click'
  | 'phone_click'
  | 'favorite_added'
  | 'inquiry_submitted';

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  property_id?: string;
  agent_id?: string;
  session_id?: string;
  source?: string;
  society?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

