import { Suspense } from "react";
import Link from "next/link";
import { getBooks } from "@/actions/books";
import { BookCard } from "@/components/books/BookCard";
import { BookFilters } from "@/components/books/BookFilters";
import { BookCardSkeleton } from "@/components/books/BookCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen, Gift, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Browse Books" };

interface BooksPageProps {
  searchParams: {
    semester?: string;
    subject?: string;
    search?: string;
    tab?: string;
  };
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const isDonation = searchParams.tab === "donations";
  const semester = searchParams.semester ? Number(searchParams.semester) : undefined;

  const booksData = await getBooks({
    semester,
    subject: searchParams.subject,
    search: searchParams.search,
    isDonation,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-heading">Books</h1>
          <p className="text-slate-500 mt-1">
            {isDonation
              ? "Free books donated by fellow students"
              : "Buy and sell academic textbooks"}
          </p>
        </div>
        <Link href="/upload/book" className="btn-primary self-start">
          <Plus className="h-4 w-4" />
          List a Book
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
        <Link
          href="/books"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            !isDonation ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Buy Books
        </Link>
        <Link
          href="/books?tab=donations"
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            isDonation ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Gift className="h-4 w-4" />
          Free Donations
        </Link>
      </div>

      {/* Filters */}
      <BookFilters
        currentSemester={searchParams.semester}
        currentSubject={searchParams.subject}
        currentSearch={searchParams.search}
        isDonation={isDonation}
      />

      {/* Grid */}
      {booksData.length === 0 ? (
        <EmptyState
          icon={isDonation ? Gift : BookOpen}
          title={isDonation ? "No donated books yet" : "No books listed yet"}
          description={
            isDonation
              ? "Be the first to donate a book and earn 300 karma points!"
              : "List your old textbooks and help fellow students."
          }
          actionLabel={isDonation ? "Donate a Book" : "List a Book"}
          actionHref="/upload/book"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
          {booksData.map((book) => (
            <BookCard key={book.id} book={book as any} />
          ))}
        </div>
      )}
    </div>
  );
}
