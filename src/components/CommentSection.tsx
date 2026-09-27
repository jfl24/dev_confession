"use client";

import { useEffect, useState } from "react";
import type { CommentCorrect } from "@/lib/types";
import { CommentForm } from "./CommentForm";
import { getComments } from "@/actions/comment.actions";
import { CommentItem } from "./CommentItem";

type Props = {
  confessionId: string;
  currentUserId?: string;
  nombreCommentaires: (counts: number) => void;
};

export function CommentSection({
  confessionId,
  currentUserId,
  nombreCommentaires,
}: Props) {
  const [comments, setComments] = useState<CommentCorrect[] | null>(null);

  useEffect(() => {
    async function loadComments() {
      const data = await getComments(confessionId);
      setComments(data);

      const total = data.reduce((t, c) => t + 1 + (c.replies?.length ?? 0), 0);

      nombreCommentaires?.(total);
    }
    loadComments();
  }, [confessionId, nombreCommentaires]);

  return (
    <div>
      {currentUserId ? (
        <CommentForm confessionId={confessionId} />
      ) : (
        <p>Connectez-vous pour commenter.</p>
      )}

      <div>
        {comments === null ? (
          <p>Chargement ...</p>
        ) : comments.length === 0 ? (
          <p>Aucun commentaire pour le moment.</p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              confessionId={confessionId}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}
