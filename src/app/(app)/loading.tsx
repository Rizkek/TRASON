'use client';

import { Loading } from '@/components/ui/Loading';
import { useTranslation } from '@/libs/i18n/useTranslation';

// Renders inside the persistent shell, so the sidebar and bottom bar stay visible while a page loads.
export default function AppLoading() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loading text={t('common.loading')} />
    </div>
  );
}
