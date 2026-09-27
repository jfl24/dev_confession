"use client";
import { CATEGORY_MAP } from "@/lib/types";
import { useState } from "react";
import { createConfession } from "@/actions/confession.actions";

export function ConfessionForm() {
  const [charCount, setCharCount] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      formData.set("isAnonymous", isAnonymous.toString());
      await createConfession(formData);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : " Une erreur est survenue",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Categorie de votre fail
        </label>
        <div className="grid grid-cols-2 md-grid-cols-3 gap-3">
          {Object.entries(CATEGORY_MAP).map(([key, { label, icon }]) => (
            <label
              key={key}
              className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition border border-gray-700 has-[:checked]:border-purple-500 text-white"
            >
              <input
                name="category"
                value={key}
                type="radio"
                defaultChecked={key === "BUG"}
              />
              <span className="text-xl">{icon}</span>
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Votre confession :{" "}
        </label>
        <textarea
          name="content"
          maxLength={500}
          placeholder="J'avoue que j'ai ..."
          onChange={(e) => setCharCount(e.target.value.length)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          required
        />
        <div className="flex justify-between mt-1">
          <span>Minimum 10 caractères</span>
          <span
            className={`text-xs ${charCount > 450 ? "text-red-400" : "text-gray-500"}`}
          >
            {charCount}/500
          </span>
        </div>
      </div>
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
        <span className="text-sm font-medium text-white">
          {isAnonymous ? "Anonyme" : "Avec mon Pseudo"}
        </span>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
      >
        Confesser
      </button>
    </form>
  );
}
