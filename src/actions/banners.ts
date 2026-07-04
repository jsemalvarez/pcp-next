"use server";

import prisma from "@/data/prisma/db";
import { revalidatePath } from "next/cache";
import { Banner } from "@/domain/entities/Banner";

export async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { priority: "asc" },
    });
    return banners;
  } catch (error) {
    console.error("[getBanners] Error:", error);
    return [];
  }
}

export async function getActiveBanners() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
      },
      orderBy: { priority: "asc" },
    });
    return banners;
  } catch (error) {
    console.error("[getActiveBanners] Error:", error);
    return [];
  }
}

export async function getBannerById(id: string) {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    return banner;
  } catch (error) {
    console.error("[getBannerById] Error:", error);
    return null;
  }
}

export type BannerInput = Omit<Banner, "id" | "createdAt" | "updatedAt">;

export async function createBanner(data: BannerInput) {
  try {
    const banner = await prisma.banner.create({
      data,
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true, data: banner };
  } catch (error: any) {
    console.error("[createBanner] Error:", error);
    return { success: false, error: error?.message || "Error al crear el banner" };
  }
}

export async function updateBanner(id: string, data: BannerInput) {
  try {
    const banner = await prisma.banner.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true, data: banner };
  } catch (error: any) {
    console.error("[updateBanner] Error:", error);
    return { success: false, error: error?.message || "Error al actualizar el banner" };
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
  } catch (error) {
    console.error("[deleteBanner] Error:", error);
    return { success: false, error: "Error al eliminar el banner" };
  }
}
