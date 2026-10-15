import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle2,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { SEOHead } from '../../components/common/SEOHead';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { submitInquiry } from '../../services/store';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Property in Bahria Town Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Please enter your full name.', 'error');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      showToast('Validation Error', 'Please enter a valid phone number.', 'error');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await submitInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: `${subject ? `[${subject}] ` : ''}${message.trim()}`,
        source: 'website',
      });
      setSubmitted(true);
      showToast('Inquiry Received', 'Thank you! Your inquiry has been saved and our office will contact you.', 'success');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      const msg = err.message || 'Unable to submit inquiry at this moment. Please call or WhatsApp us directly.';
      setErrorMessage(msg);
      showToast('Submission Failed', msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const businessPhone = settings.phone || '+92 324 4101140';
  const businessWhatsapp = settings.whatsapp || '+92 324 4101140';
  const businessAddress =
    settings.address ||
    'Tower 3, Office #17, Raiwind Road, Bahria Orchard, Eastern District, Lahore, Punjab 54000, Pakistan';
  const plusCode = settings.plus_code || '8689+FP Lahore, Pakistan';
  const directionsUrl =
    settings.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plusCode)}`;

  const weeklyHours = [
    { day: 'Monday', hours: '9:00 AM – 10:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM – 10:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM – 10:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 10:00 PM' },
    { day: 'Friday', hours: '11:00 AM – 10:00 PM', highlight: true },
    { day: 'Saturday', hours: '9:00 AM – 10:00 PM' },
    { day: 'Sunday', hours: '9:00 AM – 10:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 sm:py-16">
      <SEOHead
        title="Contact Us | Real Estate In Bahria Town / Orchard Lahore"
        description="Contact our real estate office in Bahria Orchard & Bahria Town Lahore. Call +92 324 4101140 or visit Tower 3, Office #17, Raiwind Road, Bahria Orchard Lahore."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E4E6E1] text-[11px] font-bold text-[#173C32] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B89B5E]" />
            Official Office Contact & Location
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A18] tracking-tight">
            Contact Real Estate In Bahria Town / Orchard Lahore
          </h1>
          <p className="text-sm text-[#66706A] mt-2.5 leading-relaxed">
            Have questions about buying a house in Bahria Town, plots in Bahria Orchard, or renting a commercial space along Raiwind Road? Contact our team directly or visit our office.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Agency Details Card */}
            <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#E4E6E1] pb-4">
                <h2 className="text-base font-bold text-[#171A18]">
                  Agency Office Information
                </h2>
                <p className="text-xs text-[#66706A] mt-0.5">
                  Real Estate In Bahria Town / Orchard Lahore
                </p>
              </div>

              <div className="space-y-5 text-xs text-[#66706A]">
                {/* Office Address & Plus Code */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#173C32]/8 text-[#173C32] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#173C32]" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-[#171A18] block text-xs font-bold">Office Address:</strong>
                    <span className="leading-relaxed block text-[#171A18]/80">{businessAddress}</span>
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-black/5 text-[11px] font-mono text-[#171A18] border border-[#E4E6E1]">
                        Plus Code: {plusCode}
                      </span>
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#173C32] hover:text-[#0F2D25] hover:underline"
                      >
                        <Navigation className="w-3 h-3 text-[#B89B5E]" />
                        <span>Get Directions ↗</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct Phone / Click-to-Call */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#173C32]/8 text-[#173C32] shrink-0">
                    <Phone className="w-4 h-4 text-[#173C32]" />
                  </div>
                  <div>
                    <strong className="text-[#171A18] block text-xs font-bold">Telephone (Click to Call):</strong>
                    <a
                      href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                      className="text-sm font-bold text-[#173C32] hover:text-[#0F2D25] hover:underline tracking-wide inline-block mt-0.5"
                    >
                      {businessPhone}
                    </a>
                    <span className="block text-[11px] text-[#66706A] mt-0.5">
                      Direct consultation & property inquiries
                    </span>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-[#287A58]/10 text-[#287A58] shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#287A58]" />
                  </div>
                  <div>
                    <strong className="text-[#171A18] block text-xs font-bold">WhatsApp Direct:</strong>
                    <a
                      href={`https://wa.me/${businessWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#287A58] font-bold hover:underline inline-block mt-0.5"
                    >
                      {businessWhatsapp} (Chat on WhatsApp)
                    </a>
                  </div>
                </div>

                {/* Email */}
                {settings.email && (
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#173C32]/8 text-[#173C32] shrink-0">
                      <Mail className="w-4 h-4 text-[#173C32]" />
                    </div>
                    <div>
                      <strong className="text-[#171A18] block text-xs font-bold">Official Email:</strong>
                      <a href={`mailto:${settings.email}`} className="text-xs text-[#171A18] hover:underline mt-0.5 inline-block">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Opening Hours Card */}
            <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E4E6E1] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B89B5E]" />
                  <h3 className="font-bold text-sm text-[#171A18]">Business Opening Hours</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#287A58]">
                  <span className="w-2 h-2 rounded-full bg-[#287A58]" />
                  Open Now
                </span>
              </div>

              <div className="divide-y divide-[#E4E6E1] text-xs">
                {weeklyHours.map((item) => (
                  <div
                    key={item.day}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <span className="font-semibold text-[#171A18]">{item.day}</span>
                    <span
                      className={`font-medium ${
                        item.highlight ? 'text-[#173C32] font-bold' : 'text-[#66706A]'
                      }`}
                    >
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${businessPhone.replace(/\s+/g, '')}`}
                className="py-3 px-4 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Directly</span>
              </a>
              <a
                href={`https://wa.me/${businessWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#287A58] hover:bg-[#1f5f44] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Message Form + Map Card */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact Message Form */}
            <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-[#171A18] mb-1">Send an Inquiry</h2>
              <p className="text-xs text-[#66706A] mb-6">
                Fill in your details below and our Bahria Town & Orchard real estate team will get back to you promptly.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-[#287A58]/10 border border-[#287A58]/30 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 bg-[#287A58]/20 text-[#287A58] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#171A18]">Inquiry Received</h3>
                  <p className="text-xs text-[#66706A]">
                    Thank you for reaching out. Our representative will contact you via phone or WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="text-xs text-[#173C32] underline font-bold hover:text-[#0F2D25] cursor-pointer"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                      {errorMessage}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 text-xs bg-white/75 text-[#171A18] placeholder-[#66706A] border border-[#D9DDD8] rounded-xl focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0324-4101140"
                        className="w-full px-3.5 py-2.5 text-xs bg-white/75 text-[#171A18] placeholder-[#66706A] border border-[#D9DDD8] rounded-xl focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-white/75 text-[#171A18] placeholder-[#66706A] border border-[#D9DDD8] rounded-xl focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                        Inquiry Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white/75 text-[#171A18] border border-[#D9DDD8] rounded-xl font-medium focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] outline-none transition"
                      >
                        <option value="Property in Bahria Town Inquiry">Property in Bahria Town Lahore</option>
                        <option value="Property in Bahria Orchard Inquiry">Property in Bahria Orchard</option>
                        <option value="Residential Plot Acquisition">Residential Plot Acquisition</option>
                        <option value="Commercial Shop or Plaza">Commercial Shop / Plaza</option>
                        <option value="Property Rental & Tenancy">Rental & Tenancy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171A18] uppercase tracking-wider mb-1">
                      Message / Property Requirements *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify your preferred sector, Marla size, budget in PKR, or requirements..."
                      className="w-full p-3.5 text-xs bg-white/75 text-[#171A18] placeholder-[#66706A] border border-[#D9DDD8] rounded-xl focus:ring-2 focus:ring-[#B89B5E]/30 focus:border-[#B89B5E] outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Send Inquiry to Agency'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Interactive Google Maps & Directions Section */}
            <div className="bg-white rounded-3xl border border-[#E4E6E1] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E6E1] pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#171A18] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#B89B5E]" />
                    Office Location & Map Directions
                  </h3>
                  <p className="text-xs text-[#66706A] mt-0.5">
                    Tower 3, Office #17, Raiwind Road, Bahria Orchard Lahore
                  </p>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white text-xs font-bold transition shadow-xs shrink-0"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#B89B5E]" />
                  <span>Get Directions</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>
              </div>

              {/* Embedded Interactive Map */}
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#E4E6E1]">
                <iframe
                  title="Bahria Orchard Office Map Location"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent('Tower 3, Bahria Orchard, Raiwind Road, Lahore')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#66706A] pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#171A18]">Plus Code:</span>
                  <code className="bg-black/5 px-2 py-0.5 rounded text-[11px] font-mono text-[#171A18] border border-[#E4E6E1]">
                    {plusCode}
                  </code>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#173C32] hover:underline flex items-center gap-1"
                >
                  <span>Open in Google Maps App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
