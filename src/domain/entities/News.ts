export interface News {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  content: string;
  photoId?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
