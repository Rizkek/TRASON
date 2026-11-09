'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Card, Button, Input, Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { ProfileData, UserData } from './types';
import { Camera, FloppyDisk as Save } from '@phosphor-icons/react';
import { Heading, Paragraph } from '@/components/ui/typography';

interface ProfileSectionProps {
  user: UserData | null;
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  formErrors: Record<string, string>;
  isSavingProfile: boolean;
  isUploadingAvatar: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveProfile: () => void;
}

export function ProfileSection({
  user,
  profile,
  setProfile,
  formErrors,
  isSavingProfile,
  isUploadingAvatar,
  onAvatarChange,
  onSaveProfile,
}: ProfileSectionProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="relative overflow-hidden">

      <div className="p-5 md:p-8 space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-foreground/[0.05]">
          <div className="relative group">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={onAvatarChange}
              disabled={isUploadingAvatar}
            />
            <button
              type="button"
              aria-label={t('settings_ui.change_photo')}
              disabled={isUploadingAvatar}
              className="block h-24 w-24 rounded-2xl border border-foreground/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center text-3xl font-sans font-bold tracking-tight text-foreground relative overflow-hidden">
                {isUploadingAvatar ? (
                  <Loading />
                ) : profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  profile.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
                )}
              </div>
            </button>
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -right-2 rounded-md border border-foreground/20 bg-secondary p-2 text-on-primary">
              <Camera size={14} />
            </span>
          </div>
          <div className="text-center md:text-left">
            <Heading as="h2" size="h2" className="text-xl font-semibold text-foreground tracking-tight">
              {profile.first_name || profile.last_name
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : t('common.user')}
            </Heading>
            <Paragraph className="text-sm text-muted-foreground">{user?.email}</Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label={t('settings.profile.firstName')}
            value={profile.first_name}
            onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
            error={formErrors.first_name}
          />
          <Input
            label={t('settings.profile.lastName')}
            value={profile.last_name}
            onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
          />
        </div>

        <Input
          label={t('settings.profile.contactNumber')}
          placeholder="+00 000 000 000"
          value={profile.phone}
          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
        />

        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            size="md"
            onClick={onSaveProfile}
            disabled={isSavingProfile}
            leftIcon={<Save size={18} />}
          >
            {isSavingProfile ? t('settings.profile.savingBtn') : t('settings.profile.updateBtn')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
