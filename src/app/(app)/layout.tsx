import { Layout } from '@/components/layout/Layout';
import { SmartInput } from '@/components/SmartInput';

// One persistent shell for every authenticated page, so the sidebar, push sync and offline banner
// are not torn down and rebuilt on each navigation. SmartInput is app-only: it needs a session.
export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      {children}
      <SmartInput />
    </Layout>
  );
}
