/**
 * Pakistani Currency and Unit Formatters
 */

export function formatPricePKR(
  amount: number,
  options?: { compact?: boolean; isRent?: boolean }
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'PKR 0';

  const { compact = true, isRent = false } = options || {};

  if (!compact) {
    return `PKR ${new Intl.NumberFormat('en-PK').format(amount)}${isRent ? ' / mo' : ''}`;
  }

  // Crore = 10,000,000 (10 Million PKR)
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    const formatted =
      crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(crore < 10 ? 2 : 1);
    return `PKR ${formatted} Crore${isRent ? ' / mo' : ''}`;
  }

  // Lac / Lakh = 100,000 PKR
  if (amount >= 100000) {
    const lac = amount / 100000;
    const formatted =
      lac % 1 === 0 ? lac.toFixed(0) : lac.toFixed(lac < 10 ? 2 : 1);
    return `PKR ${formatted} Lac${isRent ? ' / mo' : ''}`;
  }

  // Thousand (Hazaar)
  if (amount >= 1000) {
    return `PKR ${new Intl.NumberFormat('en-PK').format(amount)}${isRent ? ' / mo' : ''}`;
  }

  return `PKR ${amount}${isRent ? ' / mo' : ''}`;
}

export function formatExactPKR(amount: number): string {
  if (!amount && amount !== 0) return 'PKR 0';
  return `PKR ${new Intl.NumberFormat('en-PK').format(amount)}`;
}

export function formatArea(value: number, unit: string): string {
  if (!value) return `0 ${unit}`;
  return `${value.toLocaleString()} ${unit}`;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  // Strip all spaces, dashes, parentheses
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If starts with 0 (e.g. 03001234567), replace with 92
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }
  // If already starts with 92, leave it
  if (!cleaned.startsWith('92') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppLink(
  phone: string,
  property: {
    property_code: string;
    title: string;
    city: string;
    area: string;
    price: number;
    purpose: string;
  }
): string {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  const formattedPrice = formatPricePKR(property.price, {
    isRent: property.purpose === 'Rent',
  });
  const message = `Assalam-o-Alaikum! I am interested in Property ${property.property_code} (${property.title}) located at ${property.area}, ${property.city} listed for ${formattedPrice}. Please share further details, schedule a visit, or connect with the representative.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
