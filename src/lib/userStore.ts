// Persistent user identity storage (survives browser/PWA restarts)
const USER_IDENTITY_KEY = 'wtw_user_identity';

export interface PlexUser {
  username: string;
  email: string;
  thumb: string;
}

export interface StoredUserIdentity {
  type: 'plex' | 'guest';
  displayName: string;
  plexToken?: string;
  plexUser?: PlexUser;
  savedAt: number;
}

export const saveUserIdentity = (identity: Omit<StoredUserIdentity, 'savedAt'>) => {
  const data: StoredUserIdentity = { ...identity, savedAt: Date.now() };
  localStorage.setItem(USER_IDENTITY_KEY, JSON.stringify(data));
};

export const getUserIdentity = (): StoredUserIdentity | null => {
  try {
    const data = localStorage.getItem(USER_IDENTITY_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const clearUserIdentity = () => {
  localStorage.removeItem(USER_IDENTITY_KEY);
};

/**
 * Validate a stored Plex token by calling the Plex API directly.
 * Returns the user info if valid, null if expired/invalid.
 */
export const validatePlexToken = async (token: string): Promise<PlexUser | null> => {
  try {
    const res = await fetch('https://plex.tv/api/v2/user', {
      headers: {
        'Accept': 'application/json',
        'X-Plex-Token': token,
        'X-Plex-Product': 'WhatToWatch',
        'X-Plex-Client-Identifier': 'wtw-self-hosted',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      username: data.username || data.title || '',
      email: data.email || '',
      thumb: data.thumb || '',
    };
  } catch {
    return null;
  }
};
