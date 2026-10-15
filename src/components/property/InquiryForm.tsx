import React, { useState } from 'react';
import { Send, CheckCircle2, User, Phone, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitInquiry } from '../../services/store';
import { useToast } from '../../context/ToastContext';

interface InquiryFormProps {
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  agentId?: string;
  agentName?: string;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({
  propertyId,
  propertyCode,
  propertyTitle,
  agentId,
  agentName,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    `Assalam-o-Alaikum, I am interested in Property ${propertyCode} (${propertyTitle}). Please arrange a site inspection and share verification files.`
  );
  const [honeypot, setHoneypot] = useState(''); // Anti-bot protection
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot check
    if (honeypot) {
      return;
    }

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setError('Please enter a valid contact phone number.');
      return;
    }
    if (email.trim() && !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitInquiry({
        property_id: propertyId,
        property_code: propertyCode,
        property_title: propertyTitle,
        agent_id: agentId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim(),
        source: 'website',
      });

      setSubmitted(true);
      showToast('Inquiry Submitted Successfully!', 'Our real estate team will call you shortly.', 'success');
      
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore if canvas unavailable
      }
    } catch (err: any) {
      console.error('InquiryForm submit error:', err);
      const msg = err.message || 'Failed to submit inquiry. Please call or WhatsApp our office.';
      setError(msg);
      showToast('Submission error', msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#287A58]/10 border border-[#287A58]/30 rounded-2xl p-6 text-center animate-in fade-in">
        <div className="w-12 h-12 bg-[#287A58]/20 text-[#287A58] rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-[#171A18] mb-1">
          Inquiry Logged Successfully!
        </h4>
        <p className="text-xs text-[#66706A] mb-4 leading-relaxed">
          Assigned real estate consultant{' '}
          <strong className="text-[#171A18]">{agentName || 'our senior team'}</strong> has
          received your inquiry for <strong>{propertyCode}</strong> and will reach out via
          call or WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setMessage(`Follow-up inquiry for Property ${propertyCode}`);
          }}
          className="text-xs text-[#173C32] underline font-semibold hover:text-[#0F2D25]"
        >
          Send another question
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E4E6E1] shadow-xs p-6">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#171A18] flex items-center gap-1.5">
          <span>Inquire About This Property</span>
        </h3>
        <p className="text-xs text-[#66706A] mt-0.5">
          Reference Code: <span className="font-mono font-bold text-[#173C32]">{propertyCode}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-[#B84A4A]/10 border border-[#B84A4A]/30 text-xs text-[#B84A4A] font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Honeypot hidden input */}
        <input
          type="text"
          name="website_url_check"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div>
          <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
            Your Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Asad Farooq"
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none transition"
            />
            <User className="w-3.5 h-3.5 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
            Phone / WhatsApp Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +92 300 1234567"
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none transition"
            />
            <Phone className="w-3.5 h-3.5 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
            Email Address (Optional)
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. asad@gmail.com"
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none transition"
            />
            <Mail className="w-3.5 h-3.5 text-[#66706A] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#66706A] uppercase tracking-wider mb-1">
            Message / Visit Request
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 text-xs bg-white/75 hover:bg-white border border-[#D9DDD8] rounded-xl text-[#171A18] placeholder:text-[#66706A] focus:border-[#B89B5E] focus:outline-none transition resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 rounded-xl bg-[#173C32] hover:bg-[#0F2D25] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <span>Logging Lead...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Property Inquiry</span>
            </>
          )}
        </button>

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#66706A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#287A58]" />
          <span>Zero spam. Direct connection to verified agent.</span>
        </div>
      </form>
    </div>
  );
};
