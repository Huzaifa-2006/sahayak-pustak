import { notFound } from "next/navigation";
import { getBookById } from "@/actions/books";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, User, GraduationCap, Tag, Calendar,
  ArrowLeft, MessageCircle, Gift, MapPin
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import CheckoutModal from "./CheckoutModal";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const book = await getBookById(params.id);
  return { title: book?.title ?? "Book Not Found" };
}

const conditionColors: Record<string, string> = {
  new:  "bg-green-50 text-green-700 border-green-200",
  good: "bg-blue-50 text-blue-700 border-blue-200",
  fair: "bg-amber-50 text-amber-700 border-amber-200",
};

export default async function BookDetailPage({ params, searchParams }: { params: { id: string }; searchParams: any }) {
  const [book, session] = await Promise.all([
    getBookById(params.id),
    getServerSession(authOptions),
  ]);
  if (!book) notFound();

  const isLoggedIn = !!session?.user?.id;
  const isSeller   = session?.user?.id === book.sellerId;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/books" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Books
      </Link>

      {searchParams.cancelled && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm font-medium text-amber-700">
          Payment was cancelled. You can try again anytime.
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
          {book.imageUrl ? (
            <Image src={book.imageUrl} alt={book.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-20 w-20 text-slate-200" />
            </div>
          )}
          {book.isDonation && (
            <div className="absolute top-4 left-4">
              <span className="flex items-center gap-1.5 rounded-full bg-green-500 text-white text-xs font-bold px-3 py-1.5">
                <Gift className="h-3.5 w-3.5" /> FREE DONATION
              </span>
            </div>
          )}
          {(book as any).isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="font-display text-3xl font-black text-white border-4 border-white rounded-xl px-6 py-2 rotate-[-12deg]">
                SOLD
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 leading-tight">{book.title}</h1>
              <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                <User className="h-4 w-4" />
                by {book.author}
              </p>
            </div>
            <span className={cn("badge border shrink-0 mt-1", conditionColors[book.condition])}>
              {book.condition}
            </span>
          </div>

          <div className="mb-6">
            <p className={cn("font-display text-4xl font-bold", book.isDonation ? "text-green-600" : "text-slate-900")}>
              {formatCurrency(book.price)}
            </p>
            {book.isDonation && (
              <p className="text-sm text-green-600 font-medium mt-1">This book is available for free!</p>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { icon: GraduationCap, label: "Semester", value: `Semester ${book.semester}` },
              { icon: Tag,           label: "Subject",  value: book.subject },
              { icon: Calendar,      label: "Listed on",value: formatDate(book.createdAt) },
              { icon: User,          label: "Seller",   value: book.seller.name ?? "Anonymous" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                  <Icon className="h-3 w-3" />{label}
                </p>
                <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Pickup Location */}
          {book.pickupLocation && (
            <div className="mb-6 rounded-xl bg-brand-50 border border-brand-100 p-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100">
                <MapPin className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-0.5">Pickup Location</p>
                <p className="text-sm font-medium text-slate-900">{book.pickupLocation}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto space-y-3">
            {(book as any).isSold ? (
              <div className="w-full py-3 rounded-xl bg-slate-100 text-center text-sm font-semibold text-slate-400">
                This book has been sold
              </div>
            ) : book.isDonation ? (
              <a
                href={`mailto:${(book.seller as any).email}?subject=Interested in your donated book: ${book.title}&body=Hi, I saw your donation on Sahayak Pustak and I'm interested in "${book.title}". Is it still available?`}
                className="btn-primary w-full py-3"
              >
                <MessageCircle className="h-4 w-4" /> Contact Donor
              </a>
            ) : isSeller ? (
              <div className="w-full py-3 rounded-xl bg-slate-100 text-center text-sm font-semibold text-slate-400">
                This is your listing
              </div>
            ) : isLoggedIn ? (
              <CheckoutModal book={{
                id:             book.id,
                title:          book.title,
                price:          book.price,
                pickupLocation: book.pickupLocation,
              }} />
            ) : (
              <Link href="/auth/login" className="btn-primary w-full py-3">
                Sign in to Buy
              </Link>
            )}
            <Link href="/books" className="btn-secondary w-full py-3">
              Browse More Books
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
