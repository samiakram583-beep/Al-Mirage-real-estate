import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  Star,
  Plus,
  Trash2,
  Check,
  Building,
  MapPin,
  FileText,
  DollarSign,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Agent, AreaUnit, Property, PropertyImage, PropertyStatus, PropertyType, PurposeType } from '../../types';
import { getAgents, saveProperty, uploadPropertyImage } from '../../services/store';
import { useToast } from '../../context/ToastContext';
import { generateSlug } from '../../lib/formatters';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface PropertyFormProps {
  initialData?: Property;
  isEdit?: boolean;
}

const COMMON_FEATURES = [
  'Italian Imported Kitchen',
  'Spanish Marble Flooring',
  'Solar System Installed',
  'Backup Generator Ready',
  'Swimming Pool',
  'Basement Home Cinema',
  'Servant Quarters',
  'Lawn & Garden',
  'Corner Plot',
  'Park Facing',
  'Double Unit Setup',
  'CCTV Security Installed',
  'Elevator / Lift',
  'Central Air Conditioning',
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [purpose, setPurpose] = useState<PurposeType>(initialData?.purpose || 'Sale');
  const [propertyType, setPropertyType] = useState<PropertyType>(initialData?.property_type || 'House');
  const [status, setStatus] = useState<PropertyStatus>(initialData?.status || 'Available');
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : '');
  const [bedrooms, setBedrooms] = useState<number>(initialData?.bedrooms || 4);
  const [bathrooms, setBathrooms] = useState<number>(initialData?.bathrooms || 5);
  const [parkingSpaces, setParkingSpaces] = useState<number>(initialData?.parking_spaces || 2);
  const [floors, setFloors] = useState<number>(initialData?.floors || 2);
  const [areaValue, setAreaValue] = useState<string>(initialData?.area_value ? String(initialData.area_value) : '1');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>(initialData?.area_unit || 'Kanal');
  const [isFurnished, setIsFurnished] = useState<boolean>(initialData?.is_furnished || false);

  // Location
  const [province, setProvince] = useState(initialData?.province || 'Punjab');
  const [city, setCity] = useState(initialData?.city || 'Lahore');
  const [area, setArea] = useState(initialData?.area || 'Bahria Town');
  const [society, setSociety] = useState(initialData?.society || 'Bahria Town Lahore');
  const [address, setAddress] = useState(initialData?.address || '');
  const [latitude, setLatitude] = useState(initialData?.latitude || 31.3687);
  const [longitude, setLongitude] = useState(initialData?.longitude || 74.1782);

  // Agent & Status
  const [agentId, setAgentId] = useState(initialData?.agent_id || '');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.is_featured || false);
  const [isPublished, setIsPublished] = useState<boolean>(initialData?.is_published !== false);

  // Features - clean empty by default
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    initialData?.features || []
  );
  const [customFeature, setCustomFeature] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '');

  // Images - clean empty array, never inject fictional unsplash photos
  const [images, setImages] = useState<PropertyImage[]>(
    initialData?.images && initialData.images.length > 0 ? initialData.images : []
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  useEffect(() => {
    getAgents().then((res) => setAgents(res));
  }, []);

  // Auto generate slug from title if new
  useEffect(() => {
    if (!isEdit && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, isEdit, slug]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(generateSlug(val));
      setSeoTitle(`${val} | For ${purpose} in ${city}`);
    }
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures((prev) => [...prev, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  // Image Management
  const addImageByUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    const newImg: PropertyImage = {
      id: `img-${Date.now()}`,
      property_id: initialData?.id || 'temp',
      storage_path: url,
      public_url: url,
      sort_order: images.length + 1,
      is_primary: images.length === 0,
      alt_text: title || 'Property Image',
    };
    setImages((prev) => [...prev, newImg]);
    setImageUrlInput('');
    showToast('Image Added', 'New property photograph attached.', 'success');
  };

  const processAndUploadFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    const validFiles = rawFiles.filter((f) => {
      if (!f.type.startsWith('image/')) {
        showToast('Invalid file', `${f.name} is not an image (JPG, PNG, WEBP).`, 'error');
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        showToast('File too large', `${f.name} exceeds 10MB limit.`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploadingImages(true);
    let successCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgressText(`Uploading ${i + 1} of ${validFiles.length}: ${file.name}...`);
      try {
        const uploaded = await uploadPropertyImage(file);
        if (uploaded.url) {
          const newImg: PropertyImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            property_id: initialData?.id || 'temp',
            storage_path: uploaded.path,
            public_url: uploaded.url,
            sort_order: images.length + successCount + 1,
            is_primary: images.length === 0 && successCount === 0,
            alt_text: file.name,
          };
          setImages((prev) => [...prev, newImg]);
          successCount++;
        }
      } catch (err: any) {
        console.error('File upload failed:', err);
        showToast('Upload Warning', `Could not upload ${file.name}: ${err.message}`, 'error');
      }
    }

    setIsUploadingImages(false);
    setUploadProgressText('');

    if (successCount > 0) {
      showToast(
        'Images Stored',
        `Successfully uploaded ${successCount} photo(s) to permanent storage.`,
        'success'
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processAndUploadFiles(files);
    e.target.value = '';
  };

  const [isDragging, setIsDragging] = useState(false);

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((img, i) => ({ ...img, sort_order: i + 1 }));
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    processAndUploadFiles(files);
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const deleteImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Ensure at least one primary
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      showToast('Validation Error', 'Property title is required.', 'error');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      showToast('Validation Error', 'Price must be a valid positive number in PKR.', 'error');
      return;
    }
    const numArea = Number(areaValue);
    if (isNaN(numArea) || numArea <= 0) {
      showToast('Validation Error', 'Area value must be greater than zero.', 'error');
      return;
    }

    setLoading(true);

    try {
      const propertyPayload: Partial<Property> = {
        ...(initialData || {}),
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        description: description.trim(),
        purpose,
        property_type: propertyType,
        status,
        price: numPrice,
        currency: 'PKR',
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        parking_spaces: Number(parkingSpaces),
        floors: Number(floors),
        is_furnished: isFurnished,
        area_value: numArea,
        area_unit: areaUnit,
        province,
        city,
        area: area.trim(),
        society: society.trim(),
        address: address.trim() || `${area}, ${city}`,
        latitude: Number(latitude),
        longitude: Number(longitude),
        agent_id: agentId,
        is_featured: isFeatured,
        is_published: isPublished,
        features: selectedFeatures,
        images,
        seo_title: seoTitle || title,
        seo_description: seoDescription || description.slice(0, 150),
      };

      const saved = await saveProperty(propertyPayload);
      showToast(
        isEdit ? 'Property Updated' : 'Property Listed!',
        `Listing ${saved.property_code} successfully saved.`,
        'success'
      );
      navigate('/admin/properties');
    } catch (err: any) {
      showToast('Save Failed', err.message || 'Error occurred while saving.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/properties')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-amber-400 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Saving Property...' : isEdit ? 'Update Property Listing' : 'Publish New Property'}
          </button>
        </div>
      </div>

      {/* 1. Basic Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500" />
            <span>1. Basic Information</span>
          </h2>
          <p className="text-xs text-slate-500">Title, category, purpose and general overview.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Property Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 1 Kanal Brand New Ultra-Luxury Modern Villa in DHA Phase 6"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purpose *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as PurposeType)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Property Type *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Flat">Flat</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
                <option value="Office">Office</option>
                <option value="Shop">Shop</option>
                <option value="Farmhouse">Farmhouse</option>
                <option value="Building">Building</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Listing Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="Available">Available</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Property Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe architect styling, brand of fittings, kitchen features, nearby amenities..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 2. Pakistani Location Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>2. Pakistani Location Model</span>
          </h2>
          <p className="text-xs text-slate-500">Province, City, Area, Society and Geo-coordinates.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Province *
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
              <option value="Khyber Pakhtunkhwa">KPK</option>
              <option value="Balochistan">Balochistan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Lahore"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Area *
            </label>
            <input
              type="text"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. DHA"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Society / Sector / Block
            </label>
            <input
              type="text"
              value={society}
              onChange={(e) => setSociety(e.target.value)}
              placeholder="e.g. DHA Phase 6 Block C"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Exact Street Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Street 14, Sector C, DHA Phase 6, Lahore"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* 3. Property Information & Dimensions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <span>3. Price, Dimensions & Rooms</span>
          </h2>
          <p className="text-xs text-slate-500">Pakistani Marla/Kanal units, PKR amount, and bedroom counts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Price in PKR *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 98000000 (9.8 Crore)"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Tip: 1 Lac = 100,000 | 1 Crore = 10,000,000
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Area Value *
            </label>
            <input
              type="number"
              required
              step="any"
              min="0.1"
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
              placeholder="e.g. 1 or 10"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Area Unit *
            </label>
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="Marla">Marla</option>
              <option value="Kanal">Kanal</option>
              <option value="Sq. Yds">Sq. Yards (Guz)</option>
              <option value="Sq. Ft">Sq. Feet</option>
              <option value="Acre">Acre</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bedrooms
            </label>
            <input
              type="number"
              min="0"
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bathrooms
            </label>
            <input
              type="number"
              min="0"
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Car Porch / Parking
            </label>
            <input
              type="number"
              min="0"
              value={parkingSpaces}
              onChange={(e) => setParkingSpaces(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Floors
            </label>
            <input
              type="number"
              min="1"
              value={floors}
              onChange={(e) => setFloors(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isFurnished}
              onChange={(e) => setIsFurnished(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>Fully Furnished Property</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>Mark as Featured Listing</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500"
            />
            <span>Published on Website (Public)</span>
          </label>
        </div>
      </div>

      {/* 4. Amenities & Features */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>4. Features & Amenities</span>
          </h2>
          <p className="text-xs text-slate-500">Select standard amenities or add custom luxury features.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_FEATURES.map((feat) => {
            const isSelected = selectedFeatures.includes(feat);
            return (
              <button
                key={feat}
                type="button"
                onClick={() => toggleFeature(feat)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl text-left flex items-center justify-between border transition ${
                  isSelected
                    ? 'bg-[#0B192C] text-amber-400 border-slate-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{feat}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Add custom feature */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            placeholder="Add custom amenity (e.g. Turkish Hammam, Jacuzzi)..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
          <button
            type="button"
            onClick={addCustomFeature}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
          >
            + Add Feature
          </button>
        </div>
      </div>

      {/* 5. Images Management (Supabase Storage Ready) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              <span>5. Property Images ({images.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Drag & drop upload, add high-resolution URLs, set primary thumbnail, and reorder.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            Bucket: property-images
          </span>
        </div>

        {/* Upload drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!isUploadingImages) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-amber-500 bg-slate-50/50'
          }`}
        >
          {isUploadingImages ? (
            <div className="py-4 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {uploadProgressText || 'Saving images to permanent storage...'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Optimizing and syncing with Supabase Storage
              </p>
            </div>
          ) : (
            <>
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-amber-500' : 'text-slate-400'}`} />
              <p className="text-xs font-bold text-slate-700 mb-1">
                {isDragging ? 'Drop images right here to upload!' : 'Drag & drop photos here or choose files'}
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                PNG, JPG, WEBP up to 10MB each. Automatically optimized and saved in Supabase Storage.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-xs">
                <span>Browse Local Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>

        {/* Quick URL Adder */}
        <div className="flex gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Or paste direct image URL (Unsplash, CDN)..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
          <button
            type="button"
            onClick={addImageByUrl}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
          >
            Attach Photo URL
          </button>
        </div>

        {/* Image Grid Previews */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              className={`relative rounded-xl overflow-hidden border-2 bg-slate-100 group h-36 ${
                img.is_primary ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-slate-200'
              }`}
            >
              <img src={img.public_url} alt="" className="w-full h-full object-cover" />

              {img.is_primary && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-xs z-10">
                  Primary
                </div>
              )}

              {/* Order badge */}
              <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold z-10">
                #{idx + 1}
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'left')}
                    className="p-1 rounded-lg bg-white/90 hover:bg-white text-slate-900"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(idx, 'right')}
                    className="p-1 rounded-lg bg-white/90 hover:bg-white text-slate-900"
                    title="Move Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(idx)}
                    className="p-1.5 rounded-lg bg-white text-slate-900 text-[10px] font-bold"
                    title="Make Primary"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteImage(idx)}
                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Agent Assignment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500" />
            <span>6. Agent Assignment</span>
          </h2>
          <p className="text-xs text-slate-500">Inquiries and WhatsApp leads will route to this consultant.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((ag) => (
            <button
              key={ag.id}
              type="button"
              onClick={() => setAgentId(ag.id)}
              className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                agentId === ag.id
                  ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-400'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <img
                src={ag.avatar_url}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{ag.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{ag.title}</p>
                <p className="text-[10px] font-semibold text-emerald-700">{ag.phone}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 7. SEO Metadata & Clean URL Slug */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>7. SEO & URL Slug</span>
          </h2>
          <p className="text-xs text-slate-500">Search engine optimized title and canonical URL slug.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              URL Slug *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500">
                /properties/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-r-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/admin/properties')}
          className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || isUploadingImages}
          className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Processing...' : isUploadingImages ? 'Uploading Images...' : isEdit ? 'Save Changes' : 'Publish Property'}
        </button>
      </div>
    </form>
  );
};
