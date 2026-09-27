"use server";
import prisma from "@/lib/prisma";
import { getCurrentUser, syncUser } from "./user.actions";
import { Category } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function createConfession(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    await syncUser();
    const newUser = await getCurrentUser();

    if (!newUser) {
      throw new Error(
        "Synchronisation failed !  Utilisateur non authentifie après synchronisation",
      );
    }
  }

  const currentUser = user || (await getCurrentUser());

  const content = formData.get("content") as string;
  const isAnonymous = formData.get("isAnonymous") === "true";
  const category = formData.get("category") as Category;

  if (!content || content.trim().length < 10) {
    throw new Error("Le contenu doit contenir au moins 10 caractères.");
  }

  if (content.trim().length > 500) {
    throw new Error("Le contenu doit contenir au maximum 500 carateres.");
  }

  await prisma.confession.create({
    data: {
      content: content,
      isAnonymous,
      category,
      authorId: currentUser!.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/confessions");
}

// localhost:3000/confession?page=1&limit=5&category=BUG (équivalent)
export async function getConfessions(
  page: number = 1,
  limit: number = 5,
  category?: Category,
) {
  const skip = (page - 1) * limit;

  const where = category ? { category } : {};

  const [confessions, total] = await Promise.all([
    prisma.confession.findMany({
      where,
      include: {
        // POUR LA JOINTURE !
        author: { select: { userName: true, imageUrl: true } },
        reactions: { select: { emoji: true, userId: true } },
        _count: { select: { reactions: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.confession.count({ where }),
  ]);

  return {
    confessions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}
