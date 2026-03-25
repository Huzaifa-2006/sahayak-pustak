import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookUploadForm } from "./BookUploadForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "List a Book" };

export default async function UploadBookPage({
  searchParams,
}: {
  searchParams: { sell?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/upload/book");

  const defaultDonate = searchParams.sell !== "true";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-heading">List a Book</h1>
        <p className="text-slate-500 mt-2">
          Sell your old books or donate them for free. Earn{" "}
          <span className="font-semibold text-amber-600">+300 karma points</span> for donations!
        </p>
      </div>
      <div className="card p-6 sm:p-8">
        <BookUploadForm defaultDonate={defaultDonate} />
      </div>
    </div>
  );
}
