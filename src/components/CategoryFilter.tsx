"use client";

import { ChangeEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORY_MAP } from "@/lib/types";

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "TOUTES";

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value === "TOUTES") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    // Réinitialise la pagination
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentCategory}
      onChange={handleChange}
      className="border rounded p-2 text-black bg-white"
    >
      <option value="TOUTES">Toutes les catégories</option>
      {Object.entries(CATEGORY_MAP).map(([key, data]) => (
        <option key={key} value={key} className="text-black">
          {data.label}
        </option>
      ))}
    </select>
  );
}
