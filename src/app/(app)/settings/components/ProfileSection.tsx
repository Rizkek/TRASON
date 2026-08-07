'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Card, Button, Input, Loading } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { ProfileData, UserData } from './types';
import { Camera, FloppyDisk as Save } from '@phosphor-icons/react';

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
    <Card className="glass border-none shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.02] blur-3xl pointer-events-none" />

      <div className="p-xl space-y-xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-xl pb-xl border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="relative group">
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={onAvatarChange}
              disabled={isUploadingAvatar}
            />
            <div
              className="w-24 h-24 rounded-2xl bg-gradient-primary p-[2px] cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-2xl bg-gray-strong flex items-center justify-center text-3xl font-sans font-bold tracking-tight text-white relative overflow-hidden">
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
                {!isUploadingAvatar && (
                  <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-20 transition-opacity" />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-sm bg-secondary text-white rounded-md shadow-lg border border-black/20 dark:border-white/20 hover:scale-110 transition-transform disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-soft-cream tracking-tight">
              {profile.first_name || profile.last_name
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : 'Syncing Identity...'}
            </h2>
            <p className="text-sm text-gray-light italic">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
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

        <div className="flex justify-end pt-md">
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
