export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt?: string;
  lastSeenAt?: string | null;
  profilePictureUrl?: string | null;
  bio?: string | null;
}