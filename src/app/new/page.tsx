import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/actions/user.actions";
import { ConfessionForm } from "@/components/ConfessionForm";

//  Création d'une nouvelle confession avec un formulaire
export default async function NewConfessionPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await syncUser();

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text 2xl font-bold mb-6 text-gray-100">
        Nouvelle confession
      </h1>
      <p className="mb-4 text-gray-300">
        Libérez votre conscience de developpeur !
      </p>
      <ConfessionForm />
    </main>
  );
}
