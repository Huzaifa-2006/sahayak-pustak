import Link from "next/link";
import Image from "next/image";
import { BookOpen, User, GraduationCap, MapPin } from "lucide-react";
import { formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import type { BookWithSeller } from "../../../db/schema";

const conditionColors: Record<string, string> = {
  new: "bg-green-50 text-green-700 border-green-200",
  good: "bg-blue-50 text-blue-700 border-blue-200",
  fair: "bg-amber-50 text-amber-700 border-amber-200",
};

export function BookCard({ book }: { book: BookWithSeller & { pickupLocation?: string | null } }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {book.imageUrl ? (
          <Image
            src={book.imageUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {book.isDonation && (
            <span className="badge bg-green-500 text-white text-[10px] px-2 py-0.5">FREE</span>
          )}
          <span className={cn("badge border text-[10px]", conditionColors[book.condition])}>
            {book.condition}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <User className="h-3 w-3" />
            {book.author}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            Sem {book.semester}
          </span>
          <span className="text-slate-300">·</span>
          <span className="truncate">{book.subject}</span>
        </div>

        {/* Pickup location */}
        {book.pickupLocation && (
          <div className="flex items-center gap-1 text-xs text-brand-600 bg-brand-50 rounded-lg px-2 py-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{book.pickupLocation}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
          <span className={cn(
            "font-display font-bold text-lg",
            book.isDonation ? "text-green-600" : "text-slate-900"
          )}>
            {formatCurrency(book.price)}
          </span>
          <span className="text-xs text-slate-400">
            {formatRelativeTime(book.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
