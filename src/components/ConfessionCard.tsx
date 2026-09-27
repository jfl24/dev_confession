"use client";

import { useState } from "react";
import { Emoji, Confession } from "@/generated/prisma/client";
import { EMOJI_MAP, CATEGORY_MAP, ConfessionWithReactions } from "@/lib/types";
import { reagir } from "@/actions/reactions.actions";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CommentSection } from "./CommentSection";

type Props = {
  confession: ConfessionWithReactions;
  currentUserId?: string;
};

export function ConfessionCard({ confession, currentUserId }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(confession._count.comments);
  const categoryInfo = CATEGORY_MAP[confession.category];

  const reactionCounts = confession.reactions.reduce(
    (acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<Emoji, number>,
  );
  /*
    [{emoji: "LAUGH"}, {emoji:"LAUGH"}, {emoji: "FIRE"}]

    1- {}      LAUGH  --->  {LAUGH : 1}
    2- {LAUGH : 1}   LAUGH ---->  {LAUGH : 2}
    3 - {LAUGH : 2}  FIRE ----->  {LAUGH:2, FIRE:1}
    */

  const userReactions = confession.reactions
    .filter((u) => u.userId === currentUserId)
    .map((u) => u.emoji);

  async function handleReaction(emoji: Emoji) {
    if (!currentUserId) {
      alert("Connectez-vous pour pouvoir réagir");
      return;
    }

    try {
      await reagir(confession.id, emoji);
    } catch (error) {
      alert("Erreur");
    } finally {
      return;
    }
  }

  function partagerSurTwitter() {
    const maxLength = 200;
    const truncatedContent =
      confession.content.length > maxLength
        ? confession.content.substring(0, maxLength) + "..."
        : confession.content;
    const textTweet = `🎭 Confession Dev : \n\n${truncatedContent}\n\n${categoryInfo.icon} #DevConfession #ServicesWeb`;
    const tweetIntentUrl = "https://twitter.com/intent/tweet";
    const encodedUrl = encodeURIComponent(textTweet);
    const url = `${tweetIntentUrl}?text=${encodedUrl}`;

    window.open(url, "_blank");
  }

  return (
    <div className="mt-6 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{categoryInfo.icon}</span>
          <span className="text-sm text-purple-400">{categoryInfo.label}</span>
        </div>
        <time className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(confession.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </time>
      </div>

      <p className="text-gray-100 text-lg leading-relaxed mb-4 break-words">
        {confession.content}
      </p>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        {confession.isAnonymous ? (
          <>
            <span className="text-xl">🎭</span>
            <span>Dev anonyme</span>
          </>
        ) : (
          <>
            {confession.author.imageUrl && (
              <img
                src={confession.author.imageUrl}
                alt=""
                className="rounded-full w-6 h-6"
              />
            )}
            <span>{confession.author.userName}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(EMOJI_MAP) as Emoji[]).map((emoji) => {
          const count = reactionCounts[emoji] || 0;
          const hasReacted = userReactions.includes(emoji);
          return (
            <button
              key={emoji}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm transition ${
                hasReacted
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              } disable:opacity-50`}
              onClick={() => handleReaction(emoji)}
            >
              <span>{EMOJI_MAP[emoji]}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm transition ${
            showComments
              ? "bg-purple-600 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
          }`}
        >
          Commentaires
          <span>{commentCount > 0 ? `${commentCount}` : ""}</span>
        </button>
        <button
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition ml-auto"
          title="Partager sur X/Twitter"
          onClick={partagerSurTwitter}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
          </svg>
          <span>Partager</span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          confessionId={confession.id}
          currentUserId={currentUserId}
          nombreCommentaires={setCommentCount}
        />
      )}
    </div>
  );
}
