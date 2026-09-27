"use client";

import { useState } from "react";
import { createComment } from "@/actions/comment.actions";

type Props = {
  confessionId: string;
  parentId?: string;
};

const MAX_LENGTH = 300;

export function CommentForm({ confessionId, parentId }: Props) {
  const [charCount, setCharCount] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("confessionId", confessionId);
      formData.set("isAnonymous", isAnonymous.toString());
      if (parentId) formData.set("parentId", parentId);

      await createComment(formData);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit}>
      <textarea
        name="content"
        maxLength={MAX_LENGTH}
        onChange={(e) => setCharCount(e.target.value.length)}
        className="w-full bg-gray-900/60 border border-gray-700 rounded-lg p-3 text-sm text-white mt-2 mb-2 resize-none"
      />

      <div className="flex items-center gap-3">
        <button
          className={`relative w-14 h-7 rounded-full transition-colors ${isAnonymous ? "bg-purple-600" : "bg-gray-700"}`}
          type="button"
          onClick={() => setIsAnonymous(!isAnonymous)}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isAnonymous ? "left-8" : "left-1"}`}
          />
        </button>
        <span className="text-gray-300">
          {isAnonymous ? "Anonyme" : "Avec mon Pseudo"}
        </span>
        <span
          className={`ml-auto text-xs ${charCount > MAX_LENGTH - 50 ? "text-red-400" : "text-gray-500"}`}
        >
          {charCount}/{MAX_LENGTH}
        </span>
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm text-semibold px-4 py-2 rounded-lg transition"
        >
          Publier
        </button>
      </div>
    </form>
  );
}
