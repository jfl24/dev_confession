"use server";

import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Utilisateur non authentifié");
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingUser) return existingUser;

  const newUser = await prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      userName: clerkUser.username || clerkUser.firstName || "Anonymous",
      imageUrl: clerkUser.imageUrl || null,
    },
  });
}

export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  return existingUser;
}

export async function getLeaderboard() {
  // Top Confesseurs (ceux qui partagent le plus de confessions)
  // select id, username, imageUrl, nombre_de_confessions from user order_by desc
  const confessors = await prisma.user.findMany({
    select: {
      id: true,
      userName: true,
      imageUrl: true,
      _count: { select: { confessions: true } },
    },
    orderBy: { confessions: { _count: "desc" } },
    take: 10,
  });

  // Top Confessions (plus de réactions)
  const topConfessions = await prisma.confession.findMany({
    select: {
      id: true,
      content: true,
      category: true,
      isAnonymous: true,
      author: { select: { userName: true, imageUrl: true } },
      _count: { select: { reactions: true } },
    },
    orderBy: { reactions: { _count: "desc" } },
    take: 5,
  });

  // Top personnes qui réagissent

  const topUsers = await prisma.user.findMany({
    select: {
      id: true,
      userName: true,
      imageUrl: true,
      _count: { select: { reactions: true } },
    },
    orderBy: { reactions: { _count: "desc" } },
    take: 10,
  });

  return {
    confessors: confessors.filter((u) => u._count.confessions > 0),
    topConfessions: topConfessions.filter((c) => c._count.reactions > 0),
    topUsers: topUsers.filter((u) => u._count.reactions > 0),
  };
}
