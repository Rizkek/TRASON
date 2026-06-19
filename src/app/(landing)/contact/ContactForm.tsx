'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Send } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof ContactFormData]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      contactSchema.parse(formData);
      setErrors({});
      // Generate mailto link
      const subject = encodeURIComponent(`TRASON Contact from ${formData.name}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
      window.location.href = `mailto:riskiinferno@gmail.com?subject=${subject}&body=${body}`;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach((errItem) => {
          if (errItem.path[0]) newErrors[errItem.path[0].toString()] = errItem.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="bg-black/20 border border-white/5 p-8 rounded-3xl space-y-6">
      <h2 className="text-2xl font-bold font-serif mb-6">Send us a message</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-gray-light mb-2">Name</label>
          <input 
            type="text" 
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-gold transition-colors`}
            placeholder="Your name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-light mb-2">Email</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-gold transition-colors`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-bold text-gray-light mb-2">Message</label>
          <textarea 
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={`w-full bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-gold transition-colors resize-none`}
            placeholder="How can we help you?"
          />
          {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
        </div>
        <button 
          type="submit"
          className="w-full bg-warm-gold text-warm-black font-bold py-3 px-6 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Send size={18} />
          Send Message
        </button>
      </form>
    </div>
  );
}
