export interface News {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  content: string;
  photoId?: string | null;
  photoWidth?: number | null;
  photoHeight?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
