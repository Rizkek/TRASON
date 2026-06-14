'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ModuleId, ModuleLayoutProps } from '@/modules/types';
import { useModuleStatus } from '@/hooks/useModuleStatus';
import { getModuleMetadata } from '@/modules/registry';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import {
  Wallet,
  TrendingUp,
  Clock,
  Bell,
  Lightbulb,
  AlertCircle,
  ArrowLeft,
  Lock,
} from 'lucide-react';

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Wallet,
  TrendingUp,
  Clock,
  Bell,
  Lightbulb,
};

interface ModuleHeaderProps {
  moduleId: ModuleId;
  title: string;
  description?: string;
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  moduleId,
  title,
  description,
  actions,
  showBreadcrumbs = true,
}) => {
  const router = useRouter();
  const metadata = getModuleMetadata(moduleId);
  const Icon = iconMap[metadata.icon] || AlertCircle;

  return (
    <div className="mb-6">
      {showBreadcrumbs && (
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1 text-sm text-gray-light hover:text-soft-cream mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: `${metadata.color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color: metadata.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-soft-cream">{title}</h1>
            {description && (
              <p className="text-sm text-gray-light mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

interface ModuleDisabledPlaceholderProps {
  moduleId: ModuleId;
  onEnable?: () => void;
}

const ModuleDisabledPlaceholder: React.FC<ModuleDisabledPlaceholderProps> = ({
  moduleId,
  onEnable,
}) => {
  const metadata = getModuleMetadata(moduleId);
  const Icon = iconMap[metadata.icon] || AlertCircle;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${metadata.color}15` }}
      >
        <Icon className="w-8 h-8" style={{ color: metadata.color }} />
      </div>

      <h3 className="text-lg font-serif font-bold text-soft-cream mb-2">
        {metadata.name} is disabled
      </h3>

      <p className="text-sm text-gray-light max-w-sm mb-6">
        {metadata.description} Enable this module in settings to start using it.
      </p>

      {onEnable && (
        <Button onClick={onEnable} variant="primary">
          Enable {metadata.name}
        </Button>
      )}
    </div>
  );
};

interface ModuleUnavailablePlaceholderProps {
  moduleId: ModuleId;
}

const ModuleUnavailablePlaceholder: React.FC<
  ModuleUnavailablePlaceholderProps
> = ({ moduleId }) => {
  const metadata = getModuleMetadata(moduleId);
  const Icon = iconMap[metadata.icon] || Lock;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-strong flex items-center justify-center mb-4 border border-black/[0.05] dark:border-white/[0.05]">
        <Lock className="w-8 h-8 text-gray-light" />
      </div>

      <h3 className="text-lg font-serif font-bold text-soft-cream mb-2">
        {metadata.name} is unavailable
      </h3>

      <p className="text-sm text-gray-light max-w-sm">
        This module requires a subscription or additional setup. Contact
        support for access.
      </p>
    </div>
  );
};

interface ModuleDependencyWarningProps {
  missing: ModuleId[];
}

const ModuleDependencyWarning: React.FC<ModuleDependencyWarningProps> = ({
  missing,
}) => {
  const missingNames = missing.map((id) => getModuleMetadata(id).name);

  return (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
        <div>
          <h4 className="font-medium text-warning">Dependencies required</h4>
          <p className="text-sm text-warning/80 mt-1">
            This module requires the following modules to be enabled:{" "}
            {missingNames.join(', ')}.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  moduleId,
  title,
  description,
  actions,
  children,
  showBreadcrumbs = true,
}) => {
  const { status, isLoading, dependencyStatus, enable } =
    useModuleStatus(moduleId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  if (!status.isAvailable) {
    return <ModuleUnavailablePlaceholder moduleId={moduleId} />;
  }

  if (!status.isEnabled) {
    return (
      <ModuleDisabledPlaceholder moduleId={moduleId} onEnable={enable} />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ModuleHeader
        moduleId={moduleId}
        title={title}
        description={description}
        actions={actions}
        showBreadcrumbs={showBreadcrumbs}
      />

      {!dependencyStatus.ok && (
        <ModuleDependencyWarning missing={dependencyStatus.missing} />
      )}

      <div className="module-content">{children}</div>
    </div>
  );
};

export default ModuleLayout;
