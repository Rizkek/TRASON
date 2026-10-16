import React from 'react';
import Image from 'next/image';

interface AvatarUser {
  first_name?: string | null;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface AvatarProps {
  user: AvatarUser | null | undefined;
  /** Pixel size of the circle. */
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 32, className = '' }) => {
  const initial = user?.first_name?.[0] || user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-label-sm text-on-primary ${className}`}
      style={{ width: size, height: size }}
    >
      {user?.avatar_url ? (
        <Image src={user.avatar_url} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        initial
      )}
    </span>
  );
};
