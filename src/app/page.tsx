import Image from "next/image";
import { Header } from "@/components/Header";
import { getConfessions } from "@/actions/confession.actions";
import { getCurrentUser } from "@/actions/user.actions";
import { ConfessionCard } from "@/components/ConfessionCard";
import Link from "next/link";

export default async function Home() {
  const { confessions } = await getConfessions(1, 5);
  const currentUser = await getCurrentUser();

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
        {confessions.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Hall of Fame des Fails
            </h2>
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
          </section>
        )}
      </main>
    </div>
  );
}
