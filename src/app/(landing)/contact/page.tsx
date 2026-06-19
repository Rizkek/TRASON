import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Mail, MapPin, Phone } from 'lucide-react';
import { ContactForm } from './ContactForm';

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
          <ContactForm />

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
                    <p className="text-gray-light">riskiinferno@gmail.com</p>
                    <p className="text-sm text-gray-light/60 mt-1">We aim to reply within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="text-warm-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Phone</h3>
                    <p className="text-gray-light">+62 812 3456 7890</p>
                    <p className="text-sm text-gray-light/60 mt-1">Mon-Fri from 9am to 5pm (WIB).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="text-warm-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Office</h3>
                    <p className="text-gray-light">Klaten<br />Jawa Tengah, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Map */}
            <div className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
               {/* Embed Google Maps */}
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7907.337811271201!2d110.53974908521116!3d-7.7186288539880135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a45e4a2073393%3A0xa739bc39a2090c8d!2s!5e0!3m2!1sid!2sid!4v1781767456498!5m2!1sid!2sid" 
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
