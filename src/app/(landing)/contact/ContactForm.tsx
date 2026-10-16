'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { PaperPlaneRight } from '@phosphor-icons/react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FieldName = keyof ContactFormData;

const FIELD =
  'w-full resize-none rounded-xl border bg-foreground/[0.04] px-4 py-3 text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50';

function FieldError({ name, message }: { name: FieldName; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${name}-error`} className="mt-1 text-xs font-medium text-danger">
      {message}
    </p>
  );
}

// Opens the visitor's mail app with the message filled in; nothing is sent from the page itself.
export function ContactForm({ recipient = 'riskiinferno@gmail.com' }: { recipient?: string }) {
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FieldName;
    setFormData({ ...formData, [name]: e.target.value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as FieldName | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    const subject = encodeURIComponent(`TRASON Contact from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  const fieldProps = (name: FieldName) => ({
    id: name,
    name,
    value: formData[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    className: `${FIELD} ${errors[name] ? 'border-danger' : 'border-foreground/20'}`,
  });

  return (
    <div className="space-y-6 rounded-3xl border border-foreground/15 bg-surface p-6 sm:p-8">
      <h2 className="text-heading-lg text-foreground">Send us a message</h2>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-foreground">Name</label>
          <input type="text" autoComplete="name" placeholder="Your name" {...fieldProps('name')} />
          <FieldError name="name" message={errors.name} />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">Email</label>
          <input type="email" autoComplete="email" placeholder="you@example.com" {...fieldProps('email')} />
          <FieldError name="email" message={errors.email} />
        </div>
        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-semibold text-foreground">Message</label>
          <textarea rows={5} placeholder="How can we help you?" {...fieldProps('message')} />
          <FieldError name="message" message={errors.message} />
        </div>
        <button
          type="submit"
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-on-primary transition-colors hover:bg-secondary"
        >
          <PaperPlaneRight size={18} aria-hidden="true" />
          Send message
        </button>
      </form>
    </div>
  );
}
