import {
  Agent,
  Inquiry,
  LocationArea,
  Property,
  RealEstateService,
  SiteSettings,
  Testimonial,
} from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  business_name: 'Real Estate In Bahria Town / Orchard Lahore',
  tagline: 'Property Services in Bahria Town, Bahria Orchard & Lahore',
  logo_url: '',
  business_description:
    'Dedicated property consultancy focusing on residential and commercial real estate across Bahria Town Lahore, Bahria Orchard, and surrounding Lahore areas.',
  phone: '+92 324 4101140',
  whatsapp: '+92 324 4101140',
  email: 'info@realestatebahriatown.com',
  address: 'Tower 3, Office #17, Raiwind Road, Bahria Orchard, Eastern District, Lahore, Punjab 54000, Pakistan',
  city: 'Lahore',
  plus_code: '8689+FP Lahore, Pakistan',
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=8689%2BFP+Lahore,+Pakistan',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  linkedin_url: '',
  business_hours: 'Mon - Thu, Sat - Sun: 9:00 AM – 10:00 PM | Fri: 11:00 AM – 10:00 PM',
  hours_breakdown: {
    monday: '9:00 AM – 10:00 PM',
    tuesday: '9:00 AM – 10:00 PM',
    wednesday: '9:00 AM – 10:00 PM',
    thursday: '9:00 AM – 10:00 PM',
    friday: '11:00 AM – 10:00 PM',
    saturday: '9:00 AM – 10:00 PM',
    sunday: '9:00 AM – 10:00 PM',
  },
  about_text:
    'Real Estate In Bahria Town / Orchard Lahore provides dedicated property services focusing on houses, plots, and commercial properties around Bahria Town Lahore, Bahria Orchard, Raiwind Road, and neighboring Lahore localities. We facilitate buyers, sellers, landlords, and investors with local market expertise, title verification assistance, and personalized guidance.',
  default_currency: 'PKR',
  default_city: 'Lahore',
  seo_defaults: {
    title: 'Real Estate in Bahria Town / Orchard Lahore',
    description:
      'Find houses, plots, apartments and commercial properties in Bahria Town Lahore, Bahria Orchard, and surrounding areas.',
    keywords:
      'real estate in bahria town lahore, bahria orchard lahore, houses for sale bahria town, plots in bahria orchard, lahore property, Raiwind Road real estate',
  },
};

// ==============================================================================
// PRODUCTION INITIAL DATA (0 Records - Clean Slate per Section 31 & 42)
// The client will populate all listings, agents, and testimonials from the dashboard.
// ==============================================================================
export const INITIAL_PROPERTIES: Property[] = [];
export const INITIAL_AGENTS: Agent[] = [];
export const INITIAL_TESTIMONIALS: Testimonial[] = [];
export const INITIAL_INQUIRIES: Inquiry[] = [];
export const INITIAL_SERVICES: RealEstateService[] = [];

// Geographic reference areas for Bahria Town & Orchard Lahore
export const INITIAL_POPULAR_AREAS: LocationArea[] = [
  {
    id: 'area-bahria-town',
    name: 'Bahria Town Lahore',
    slug: 'bahria-town-lahore',
    city: 'Lahore',
    province: 'Punjab',
    image_url:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    description:
      'Master-planned community featuring Sector A through F, Grand Jamia Mosque, Eiffel Tower replica, themed commercial markets, and secure living.',
    popular_societies: ['Sector C', 'Sector D', 'Sector E', 'Sector F', 'Safari Villas'],
    properties_count: 0,
  },
  {
    id: 'area-bahria-orchard',
    name: 'Bahria Orchard Lahore',
    slug: 'bahria-orchard-lahore',
    city: 'Lahore',
    province: 'Punjab',
    image_url:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description:
      'Scenic residential development situated on main Raiwind Road, divided across Phase 1, Phase 2, Phase 3, and Phase 4 with tranquil green parks and commercial plazas.',
    popular_societies: ['Phase 1', 'Phase 2 (OFS)', 'Phase 3', 'Phase 4', 'Central District'],
    properties_count: 0,
  },
  {
    id: 'area-raiwind-road',
    name: 'Raiwind Road Corridor',
    slug: 'raiwind-road-lahore',
    city: 'Lahore',
    province: 'Punjab',
    image_url:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    description:
      'Key developmental arterial corridor linking Lake City, Al-Kabir Town, Pine Enclave, and Bahria Orchard with direct Lahore Ring Road connectivity.',
    popular_societies: ['Lake City', 'Al-Kabir Town', 'Pine Enclave', 'Fazaia Housing'],
    properties_count: 0,
  },
  {
    id: 'area-dha-lahore',
    name: 'DHA Lahore',
    slug: 'dha-lahore',
    city: 'Lahore',
    province: 'Punjab',
    image_url:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    description:
      'Premier housing authority development across Phases 1 through 9 Prism in Lahore.',
    popular_societies: ['Phase 5', 'Phase 6', 'Phase 8', 'Phase 9 Prism'],
    properties_count: 0,
  },
];

// ==============================================================================
// DEVELOPMENT / SANDBOX SAMPLE DATA (OPTIONAL - Accessible via Admin Sandbox)
// Clearly separated so live production starts with 0 records.
// ==============================================================================
export const DEV_SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'sample-prop-1',
    property_code: 'BT-101',
    title: '10 Marla Brand New Designer House in Sector C Bahria Town Lahore',
    slug: '10-marla-designer-house-sector-c-bahria-town-lahore',
    description:
      'Double-storey residential house located in Sector C, Bahria Town Lahore near Grand Jamia Mosque. 4 master bedrooms with attached baths, 2 kitchens with imported fittings, TV lounges, car porch, and servant quarter.',
    purpose: 'Sale',
    property_type: 'House',
    status: 'Available',
    price: 38500000,
    currency: 'PKR',
    bedrooms: 4,
    bathrooms: 5,
    parking_spaces: 2,
    floors: 2,
    is_furnished: false,
    area_value: 10,
    area_unit: 'Marla',
    province: 'Punjab',
    city: 'Lahore',
    area: 'Bahria Town',
    society: 'Bahria Town Lahore',
    block: 'Sector C, Gulbahar Block',
    address: 'Gulbahar Block, Sector C, Bahria Town, Lahore',
    latitude: 31.3687,
    longitude: 74.1782,
    agent_id: 'sample-agent-1',
    is_featured: true,
    is_published: true,
    views_count: 140,
    features: [
      'Near Grand Jamia Mosque',
      'Solid Teak Wood Carpentry',
      'Dual Unit Configuration',
      '24/7 Security Patrol',
      'Dedicated Laundry Area',
    ],
    images: [
      {
        id: 'sample-img-1',
        property_id: 'sample-prop-1',
        storage_path: 'property-images/BT-101/1.jpg',
        public_url:
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Front elevation 10 Marla Sector C Bahria Town',
        sort_order: 1,
        is_primary: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seo_title: '10 Marla House for Sale in Sector C Bahria Town Lahore | BT-101',
    seo_description:
      'Buy 10 Marla house in Sector C Bahria Town Lahore near Grand Jamia Mosque. 4 bedrooms, dual unit.',
  },
  {
    id: 'sample-prop-2',
    property_code: 'BO-201',
    title: '5 Marla Brand New Modern House in Phase 1 Bahria Orchard Lahore',
    slug: '5-marla-brand-new-house-phase-1-bahria-orchard-lahore',
    description:
      'Newly completed 5 Marla double-storey house in Eastern Block, Phase 1 Bahria Orchard on main Raiwind Road. 3 bedrooms with ensuite luxury baths, stylish open kitchen, drawing room, and car porch. Possession and utilities available.',
    purpose: 'Sale',
    property_type: 'House',
    status: 'Available',
    price: 18500000,
    currency: 'PKR',
    bedrooms: 3,
    bathrooms: 4,
    parking_spaces: 1,
    floors: 2,
    is_furnished: false,
    area_value: 5,
    area_unit: 'Marla',
    province: 'Punjab',
    city: 'Lahore',
    area: 'Bahria Orchard',
    society: 'Bahria Orchard Lahore',
    block: 'Phase 1 Eastern Block',
    address: 'Eastern Block, Phase 1, Bahria Orchard, Raiwind Road, Lahore',
    latitude: 31.332,
    longitude: 74.226,
    agent_id: 'sample-agent-1',
    is_featured: true,
    is_published: true,
    views_count: 95,
    features: [
      'Gated Community with 24/7 Power',
      'Walking Distance to Community Park',
      'Raiwind Road Direct Access',
      'Underground Electrification',
    ],
    images: [
      {
        id: 'sample-img-2',
        property_id: 'sample-prop-2',
        storage_path: 'property-images/BO-201/1.jpg',
        public_url:
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
        alt_text: '5 Marla house Bahria Orchard',
        sort_order: 1,
        is_primary: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seo_title: '5 Marla House for Sale in Phase 1 Bahria Orchard Lahore | BO-201',
    seo_description:
      'Buy 5 Marla house in Phase 1 Bahria Orchard on Raiwind Road Lahore. 3 beds, peaceful location.',
  },
  {
    id: 'sample-prop-3',
    property_code: 'BO-202',
    title: '1 Kanal Residential Plot in Phase 2 Bahria Orchard Lahore',
    slug: '1-kanal-residential-plot-phase-2-bahria-orchard-lahore',
    description:
      'Prime 1 Kanal residential plot in J Block, Phase 2 Bahria Orchard Lahore. Near commercial boulevard, clean registry, possession ready for immediate home construction.',
    purpose: 'Sale',
    property_type: 'Plot',
    status: 'Available',
    price: 16500000,
    currency: 'PKR',
    bedrooms: 0,
    bathrooms: 0,
    parking_spaces: 0,
    floors: 0,
    is_furnished: false,
    area_value: 1,
    area_unit: 'Kanal',
    province: 'Punjab',
    city: 'Lahore',
    area: 'Bahria Orchard',
    society: 'Bahria Orchard Lahore',
    block: 'Phase 2 Block J',
    address: 'Block J, Phase 2, Bahria Orchard, Lahore',
    latitude: 31.328,
    longitude: 74.221,
    agent_id: 'sample-agent-1',
    is_featured: false,
    is_published: true,
    views_count: 60,
    features: ['Possession Ready', 'Near Commercial Hub', 'All Utility Dues Paid'],
    images: [
      {
        id: 'sample-img-3',
        property_id: 'sample-prop-3',
        storage_path: 'property-images/BO-202/1.jpg',
        public_url:
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        alt_text: '1 Kanal plot Bahria Orchard',
        sort_order: 1,
        is_primary: true,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seo_title: '1 Kanal Plot for Sale in Phase 2 Bahria Orchard Lahore | BO-202',
    seo_description: 'Buy 1 Kanal residential plot in Phase 2 Bahria Orchard Lahore.',
  },
];

export const DEV_SAMPLE_AGENTS: Agent[] = [
  {
    id: 'sample-agent-1',
    name: 'Property Advisory Desk',
    email: 'info@realestatebahriatown.com',
    phone: '+92 324 4101140',
    whatsapp: '+92 324 4101140',
    avatar_url:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    title: 'Bahria Town & Orchard Property Consultant',
    agency_name: 'Real Estate In Bahria Town / Orchard Lahore',
    license_number: 'PRA-LHR-REGISTERED',
    bio: 'Assisting clients with property buying, selling, and tenancy agreements across Bahria Town Lahore, Bahria Orchard, and surrounding areas.',
    experience_years: 5,
    areas_served: ['Bahria Town Lahore', 'Bahria Orchard', 'Raiwind Road'],
    is_active: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    rating: 5,
  },
];

export const DEV_SAMPLE_SERVICES: RealEstateService[] = [
  {
    id: 'sample-serv-1',
    title: 'Property Buying Assistance',
    slug: 'property-buying-assistance',
    short_description:
      'Guidance in identifying and purchasing houses and plots in Bahria Town and Bahria Orchard.',
    full_description:
      'We assist buyers in finding verified houses and residential or commercial plots matching their budget in Bahria Town Lahore and Bahria Orchard phases.',
    icon_name: 'Home',
    benefits: ['Physical property visits', 'File verification support', 'Market price guidance'],
    is_published: true,
  },
  {
    id: 'sample-serv-2',
    title: 'Property Selling & Marketing',
    slug: 'property-selling-marketing',
    short_description:
      'Listing and connecting property owners with qualified prospective buyers.',
    full_description:
      'We market houses and plots to active buyers looking for properties in Bahria Town and Orchard.',
    icon_name: 'Building2',
    benefits: ['Listing presentation', 'Direct buyer inquiries', 'Transfer coordination'],
    is_published: true,
  },
  {
    id: 'sample-serv-3',
    title: 'Rental Property Management',
    slug: 'rental-property-management',
    short_description:
      'Connecting landlords with suitable tenants for houses and commercial shops.',
    full_description:
      'Facilitating residential tenancy agreements for families and executives in gated communities.',
    icon_name: 'Key',
    benefits: ['Tenant coordination', 'Tenancy contract preparation'],
    is_published: true,
  },
];
