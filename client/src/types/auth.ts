export interface AuthUser {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
}