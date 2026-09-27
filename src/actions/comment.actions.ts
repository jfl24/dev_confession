"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, syncUser } from "./user.actions";
import prisma from "@/lib/prisma";
import { CommentCorrect } from "@/lib/types";
import { ReportReason } from "@/generated/prisma/enums";

export async function createComment(formData: FormData) {
  try {
    let user = await getCurrentUser();

    if (!user) {
      await syncUser();
      user = await getCurrentUser();

      if (!user)
        throw new Error(
          "Synchronisation failed !  Utilisateur non authentifie après synchronisation",
        );
    }

    const confessionId = formData.get("confessionId") as string;
    const content = formData.get("content") as string;
    const parentId = (formData.get("parentId") as string) || null;
    const isAnonymous = formData.get("isAnonymous") === "true";

    const contentTrim = content.trim();
    if (contentTrim.length < 2) {
      throw new Error("Votre commentaire doit contenir au moins 2 caractères.");
    }
    if (contentTrim.length > 300) {
      throw new Error("Votre commentaire ne peut pas dépasser 300 caractères.");
    }

    const confession = await prisma.confession.findUnique({
      // selecti id from confession where id = confessionId
      where: { id: confessionId },
      select: { id: true },
    });
    if (!confession) {
      throw new Error("Confession introuvable.");
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { confessionId: true, parentId: true },
      });
      if (!parent) {
        throw new Error(
          "Le commentaire dont on veut commenter est introuvable.",
        );
      }

      if (parent.parentId) {
        throw new Error("On ne peut pas répondre à une réponse.");
      }
    }

    await prisma.comment.create({
      data: {
        content: contentTrim,
        isAnonymous,
        authorId: user.id,
        confessionId,
        parentId,
      },
    });

    revalidatePath("/");
    revalidatePath("/confessions");
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getComments(
  confessionId: string,
): Promise<CommentCorrect[]> {
  const viewers = await getCurrentUser();

  const confession = await prisma.confession.findUnique({
    where: { id: confessionId },
    select: { authorId: true },
  });
  if (!confession) return [];

  const comments = await prisma.comment.findMany({
    where: { confessionId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { id: true, userName: true, imageUrl: true },
      },
      _count: { select: { report: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, userName: true, imageUrl: true } },
          _count: { select: { report: true } },
        },
      },
    },
  });

  type CommentParent = (typeof comments)[number];
  type CommentEnfant = CommentParent["replies"][number];

  function chaqueCommentaire(c: CommentParent | CommentEnfant): CommentCorrect {
    const authComment = viewers?.id === c.authorId;
    const authConfession = viewers?.id === confession?.authorId;
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      isAnonymous: c.isAnonymous,
      author: c.isAnonymous
        ? null
        : { username: c.author.userName, imageUrl: c.author.imageUrl },
      isHidden: c._count.report >= 3,
      canDelete: Boolean(authComment || authConfession),
    };
  }

  return comments.map((c) => ({
    ...chaqueCommentaire(c),
    replies: c.replies.map(chaqueCommentaire),
  }));
}

export async function deleteComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Non autorise");
  }

  const commentaire = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
      confession: { select: { authorId: true } },
    },
  });

  if (!commentaire) {
    throw new Error("Commentaire introuvable");
  }

  const commentAuthor = commentaire.authorId === user.id;
  const confessionAuthor = commentaire.confession.authorId === user.id;

  if (!commentAuthor && !confessionAuthor) {
    throw new Error("Vous ne pouvez pas supprimer ce commentaire!");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath("/");
  revalidatePath("/confessions");
}

export async function reportComment(commentId: string, reason: ReportReason) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Connectez-vous pour signaler");
  }

  const commentaire = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
    },
  });

  if (!commentaire) {
    throw new Error("Commentaire introuvable");
  }

  // RG : Regle de gestion
  if (commentaire.authorId === user.id) {
    throw new Error("On ne peut pas signaler son propre commentaire");
  }

  try {
    await prisma.commentReport.create({
      data: {
        commentId,
        reporterId: user.id,
        reason,
      },
    }); // P2002 = violation de @@unique
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      throw new Error("Vous avez déjà signalé ce commentaire !");
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/confessions");
}
