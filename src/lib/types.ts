import { Emoji, Category, ReportReason } from "../generated/prisma/client";

export const EMOJI_MAP: Record<Emoji, string> = {
  LAUGH: "😂",
  HEART: "❤️",
  FIRE: "🔥",
  SALUTE: "🫡",
  SKULL: "💀",
  FACEPALM: "🤦‍♂️",
};

export const CATEGORY_MAP: Record<Category, { label: string; icon: string }> = {
  BUG: { label: "bug", icon: "🐛" },
  GIT_DISASTER: { label: "git disaster", icon: "💥" },
  PRODUCTION_FAIL: { label: "production fail", icon: "🚨" },
  COFFEE_NEEDED: { label: "coffee needed", icon: "☕" },
  UPDATE_PROBLEM: { label: "update problem", icon: "😰" },
  VERSION_PROBLEM: { label: "version problem", icon: "🌊" },
};

export type ConfessionWithReactions = {
  id: string;
  content: string;
  isAnonymous: boolean;
  category: Category;
  createdAt: Date;
  author: {
    userName: string | null;
    imageUrl: string | null;
  };
  reactions: {
    emoji: Emoji;
    userId: string;
  }[];
  _count: {
    reactions: number;
    comments: number;
  };
};

export const CREDIT_PACK = [
  {
    id: "pack_10",
    credits: 10,
    price: 0.99,
    label: "10 credits",
    popular: false,
  },
  {
    id: "pack_50",
    credits: 50,
    price: 3.99,
    label: "50 credits",
    popular: true,
  },
  {
    id: "pack_100",
    credits: 100,
    price: 6.99,
    label: "100 credits",
    popular: false,
  },
  {
    id: "pack_500",
    credits: 500,
    price: 29.99,
    label: "500 credits",
    popular: false,
  },
] as const; // Pour considérer chaque valeur de la table comme constante

export type packId = (typeof CREDIT_PACK)[number]["id"];

export const REPORT_REASON_MAP: Record<ReportReason, string> = {
  SPAM: "spam",
  HARASSMENT: "propos agressifs",
  FRAUD: "fraude potentielle",
  OFF_TOPIC: "hors sujet",
  OTHER: "Autre motif",
};

export type CommentCorrect = {
  id: string;
  content: string;
  createdAt: Date;
  isAnonymous: boolean;
  author: {
    username: string | null;
    imageUrl: string | null;
  } | null;
  isHidden: boolean;
  canDelete: boolean;
  replies?: CommentCorrect[];
};
