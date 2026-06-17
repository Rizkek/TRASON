'use client';

import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-warm-black text-soft-cream font-sans relative overflow-x-hidden">
      <LandingNavbar />
      
      <main className="pt-32 md:pt-48 pb-24 px-lg max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-md max-w-3xl mx-auto mb-16">
           <h1 className="text-5xl md:text-7xl font-serif">Contact Us</h1>
           <p className="text-xl text-gray-light/60">Have questions, feedback, or need support? We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-black/20 border border-white/5 p-8 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold font-serif mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-light mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-gold transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-light mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-gold transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-light mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-gold transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button className="w-full bg-warm-gold text-warm-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h2 className="text-2xl font-bold font-serif">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="text-warm-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Email</h3>
                    <p className="text-gray-light">hello@trason.app</p>
                    <p className="text-sm text-gray-light/60 mt-1">We aim to reply within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="text-warm-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Phone</h3>
                    <p className="text-gray-light">+62 811 1234 5678</p>
                    <p className="text-sm text-gray-light/60 mt-1">Mon-Fri from 9am to 5pm (WIB).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="text-warm-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Office</h3>
                    <p className="text-gray-light">123 Innovation Drive<br />Tech District, Jakarta 12190</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Map */}
            <div className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
               {/* Embed Google Maps */}
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d126920.24040187422!2d106.7495006!3d-6.2297465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x100c5e82dd4b820!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1718600000000!5m2!1sen!2sid" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0, filter: 'grayscale(1) invert(0.9) hue-rotate(180deg) opacity(0.8)' }} 
                 allowFullScreen={false} 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
               />
               <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-3xl" />
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
