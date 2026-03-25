import { getNotes } from "@/actions/notes";
import { NoteCard } from "@/components/notes/NoteCard";
import { NotesFilters } from "@/components/notes/NotesFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Notes" };

interface NotesPageProps {
  searchParams: {
    semester?: string;
    subject?: string;
    search?: string;
  };
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const semester = searchParams.semester ? Number(searchParams.semester) : undefined;

  const notesData = await getNotes({
    semester,
    subject: searchParams.subject,
    search: searchParams.search,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-heading">Notes</h1>
          <p className="text-slate-500 mt-1">
            Free PDF notes shared by fellow students · Always free to download
          </p>
        </div>
        <Link href="/upload/note" className="btn-primary self-start">
          <Plus className="h-4 w-4" />
          Upload Notes
        </Link>
      </div>

      {/* Info banner */}
      <div className="mb-6 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-700 flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0" />
        <span>All notes on Sahayak Pustak are <strong>always free</strong> to download. Upload notes and earn <strong>+50 karma points</strong>!</span>
      </div>

      <NotesFilters
        currentSemester={searchParams.semester}
        currentSubject={searchParams.subject}
        currentSearch={searchParams.search}
      />

      {notesData.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes found"
          description="Be the first to share notes for this subject. Earn 50 karma points!"
          actionLabel="Upload Notes"
          actionHref="/upload/note"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {notesData.map((note) => (
            <NoteCard key={note.id} note={note as any} />
          ))}
        </div>
      )}
    </div>
  );
}
