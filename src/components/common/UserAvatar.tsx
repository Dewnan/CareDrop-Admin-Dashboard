import React, { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

const getInitials = (fullName: string): string => {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarInitials,
  avatarUrl,
  className = 'user-table-avatar',
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  // Compute public Supabase bucket URL if relative path provided
  const getResolvedUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/caredrop_avatars/${url.replace(/^\//, '')}`;
    }
    return url;
  };

  const resolvedUrl = getResolvedUrl(avatarUrl);
  const initials = avatarInitials || getInitials(name);

  return (
    <div className={className} style={style}>
      {resolvedUrl && !hasError ? (
        <img
          src={resolvedUrl}
          alt={name}
          className="avatar-img-table"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
