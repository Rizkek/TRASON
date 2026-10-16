import React from 'react';
import type { Metadata } from 'next';
import { PageShell } from '@/components/landing/page/PageShell';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Answers to common questions about TRASON, and how to reach the team.',
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return (
    <PageShell width="article">
      <SupportClient />
    </PageShell>
  );
}
