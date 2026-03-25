import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NoteUploadForm } from "./NoteUploadForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Upload Notes" };

export default async function UploadNotePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/upload/note");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-heading">Upload Notes</h1>
        <p className="text-slate-500 mt-2">
          Share your PDF notes with fellow students. Earn{" "}
          <span className="font-semibold text-amber-600">+50 karma points</span> for every upload!
          Notes are always free to download.
        </p>
      </div>
      <div className="card p-6 sm:p-8">
        <NoteUploadForm />
      </div>
    </div>
  );
}
