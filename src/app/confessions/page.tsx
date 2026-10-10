// Lister - Afficher - Filter - Pagination des confessions
import Image from "next/image";
import { Header } from "@/components/Header";
import { getConfessions } from "@/actions/confession.actions";
import { getCurrentUser } from "@/actions/user.actions";
import { ConfessionCard } from "@/components/ConfessionCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import Link from "next/link";
import { Category } from "@/generated/prisma/enums";

interface PageConfessionsProps {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function PageConfessions({
  searchParams,
}: PageConfessionsProps) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const category = (params.category as Category) || undefined;
  const { confessions } = await getConfessions(1, 12, category);

  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6x font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              DevConfessions
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            La liste des confessions des developpeurs. Sans jugement.
          </p>
          <Link
            href="/new"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg transition transform hover:scale-105 font-semibold"
          >
            Confesser mon fail
          </Link>
        </section>
        <section>
          <div className="flex gap-12 mx-auto px-4 items-center mb-6">
            <h3 className="text-xl font-bold text-white flex gap-2">
              Filtrer les confessions
            </h3>
            <label>Par Catégorie :</label>
            <CategoryFilter />
          </div>
          {confessions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <p>Aucune confession trouvée dans cette catégorie.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {confessions.map((c) => (
                <div key={c.id} className="relative">
                  <ConfessionCard
                    confession={c}
                    currentUserId={currentUser?.id}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
