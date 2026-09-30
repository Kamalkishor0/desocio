export interface AuthUser {
  id: string;
  name: string;
  username: string;
  referralCode?: string;
  email: string;
  createdAt?: string;
  lastSeenAt?: string | null;
  profilePictureUrl?: string | null;
  bio?: string | null;
  showOnlineStatus?: boolean;
}