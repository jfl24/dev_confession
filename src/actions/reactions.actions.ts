"use server";
import { Emoji } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/actions/user.actions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function reagir(confessionId: string, emoji: Emoji) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Connectez-vous pour réagir !");
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingReaction = await tx.reaction.findUnique({
      where: {
        confessionId_userId_emoji: {
          confessionId,
          userId: user.id,
          emoji,
        },
      },
    });

    // --- cas 1 : Réaction existante !
    if (existingReaction) {
      await tx.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return { action: "Supprimer Reaction" };
    }

    // --- cas 2 : Réaction existe pas !
    if (!existingReaction) {
      await tx.reaction.create({
        data: {
          confessionId,
          userId: user.id,
          emoji,
        },
      });

      return { action: "Ajout Reaction" };
    }
  });

  revalidatePath("/");
  revalidatePath("/confessions");
  return result;
}

export async function getReactionCounts(confessionId: string) {
  const reactions = await prisma.reaction.groupBy({
    by: ["emoji"],
    where: { confessionId },
    _count: { emoji: true },
  });

  return reactions.reduce(
    (acc, r) => ({ ...acc, [r.emoji]: r._count.emoji }),
    {} as Record<Emoji, number>,
  );
}
