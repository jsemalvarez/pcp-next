"use server";

import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";
import { News } from "@/domain/entities/News";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// Generar un slug único para la noticia
async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.news.findFirst({
      where: {
        slug,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });

    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function getNews() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    });
    return news;
  } catch (error) {
    console.error("[getNews] Error:", error);
    return [];
  }
}

export async function getActiveNews() {
  try {
    const news = await prisma.news.findMany({
      where: {
        isActive: true,
        publishedAt: {
          lte: new Date(),
        },
      },
      orderBy: { publishedAt: "desc" },
    });
    return news;
  } catch (error) {
    console.error("[getActiveNews] Error:", error);
    return [];
  }
}

export async function getNewsById(id: string) {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id },
    });
    return newsItem;
  } catch (error) {
    console.error("[getNewsById] Error:", error);
    return null;
  }
}

export async function getNewsBySlug(slug: string) {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { slug },
    });
    return newsItem;
  } catch (error) {
    console.error("[getNewsBySlug] Error:", error);
    return null;
  }
}

export type NewsInput = Omit<News, "id" | "slug" | "createdAt" | "updatedAt"> & {
  slug?: string | null;
};

export async function createNews(data: NewsInput) {
  try {
    const baseSlugName = data.slug || data.title;
    const slug = await generateUniqueSlug(baseSlugName);
    
    const newsItem = await prisma.news.create({
      data: {
        ...data,
        slug,
      },
    });

    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath("/admin/noticias");
    return { success: true, data: newsItem };
  } catch (error: any) {
    console.error("[createNews] Error:", error);
    return { success: false, error: error?.message || "Error al crear la noticia" };
  }
}

export async function updateNews(id: string, data: NewsInput) {
  try {
    const baseSlugName = data.slug || data.title;
    const slug = await generateUniqueSlug(baseSlugName, id);

    const newsItem = await prisma.news.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });

    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${newsItem.slug}`);
    revalidatePath("/admin/noticias");
    return { success: true, data: newsItem };
  } catch (error: any) {
    console.error("[updateNews] Error:", error);
    return { success: false, error: error?.message || "Error al actualizar la noticia" };
  }
}

export async function deleteNews(id: string) {
  try {
    const newsItem = await prisma.news.findUnique({
      where: { id },
      select: { slug: true },
    });

    await prisma.news.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/noticias");
    if (newsItem) {
      revalidatePath(`/noticias/${newsItem.slug}`);
    }
    revalidatePath("/admin/noticias");
    return { success: true };
  } catch (error) {
    console.error("[deleteNews] Error:", error);
    return { success: false, error: "Error al eliminar la noticia" };
  }
}
