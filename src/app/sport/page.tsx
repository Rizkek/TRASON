import { Metadata } from 'next';
import { SportPageClient } from './SportPageClient';

export const metadata: Metadata = {
  title: 'Sport | TRASON',
  description: 'Track your workouts, personal records, and physical activities.',
};

export default function SportPage() {
  return <SportPageClient />;
}
