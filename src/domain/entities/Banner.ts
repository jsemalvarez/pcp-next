export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
  photoId?: string | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
