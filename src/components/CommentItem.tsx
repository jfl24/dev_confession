"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { use, useState } from "react";
import { deleteComment, reportComment } from "@/actions/comment.actions";
import { CommentCorrect, REPORT_REASON_MAP } from "@/lib/types";
import { ReportReason } from "@/generated/prisma/enums";
import { CommentForm } from "./CommentForm";

type Props = {
  comment: CommentCorrect;
  confessionId: string;
  currentUserId?: string;
  isReply?: boolean;
};

export function CommentItem({
  comment,
  confessionId,
  currentUserId,
  isReply,
}: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (comment.isHidden) {
    return (
      <div>
        Ce commentaire a été masqué à la suite de plusieurs signalements.
      </div>
    );
  }

  async function supprimerComment() {
    if (!confirm("Vous êtes sûrs de vouloir supprimer ?")) {
      return;
    }

    try {
      await deleteComment(comment.id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Erreur");
    }
  }

  async function signalerComment(reason: ReportReason) {
    setShowReason(true);
    try {
      await reportComment(comment.id, reason);
      setNotice("Signalement enregistré, Merci");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <div className="py-3">
      <div className="flex items-center gap-2 mb-1">
        {comment.author?.imageUrl ? (
          <img src={comment.author.imageUrl} className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
            {comment.isAnonymous
              ? "🎭"
              : (comment.author?.username?.charAt(0).toUpperCase() ?? "?")}
          </div>
        )}
        <div className="text-sm text-gray-300">
          {comment.isAnonymous
            ? "Dev Anonyme"
            : (comment.author?.username ?? "Anonymous")}
        </div>
        <time className="ml-auto text-xs text-gray-500">
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </time>
      </div>
      <p className="text-sm text-gray-200 pl-8 leading-relaxed">
        {comment.content}
      </p>

      <div className="flex items-center gap-3 mt-1 pl-8 text-xs">
        {currentUserId && !isReply && (
          <button onClick={() => setShowReplyForm((v) => !v)}>Reponse</button>
        )}
        {currentUserId && (
          <button onClick={() => setShowReason((v) => !v)}>Signaler</button>
        )}

        {comment.canDelete && (
          <button onClick={supprimerComment}>Supprimer</button>
        )}
      </div>

      {showReason && (
        <div>
          {(Object.keys(REPORT_REASON_MAP) as ReportReason[]).map((r) => (
            <button key={r} onClick={() => signalerComment(r)}>
              {REPORT_REASON_MAP[r]}
            </button>
          ))}
        </div>
      )}
      {notice && <p>{notice}</p>}

      {/*** En HAUT C'EST NOTRE COMMENTAIRE***/}
      {showReplyForm && (
        <div>
          <CommentForm confessionId={confessionId} parentId={comment.id} />
        </div>
      )}

      {/*** AFFICHER REPONSE IMBRIQUER***/}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              confessionId={confessionId}
              currentUserId={currentUserId}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
