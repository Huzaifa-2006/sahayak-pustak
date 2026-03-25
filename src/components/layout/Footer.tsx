import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Sahayak Pustak"
              width={44}
              height={44}
              className="object-contain"
            />
            <div>
              <p className="font-display text-base font-bold text-slate-900">Sahayak Pustak</p>
              <p className="text-xs text-slate-500">University of Mumbai · Central Railway Region</p>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <Link href="/books" className="hover:text-brand-600 transition-colors">Books</Link>
            <Link href="/notes" className="hover:text-brand-600 transition-colors">Notes</Link>
            <Link href="/leaderboard" className="hover:text-brand-600 transition-colors">Leaderboard</Link>
            <Link href="/upload/book" className="hover:text-brand-600 transition-colors">Donate a Book</Link>
            <Link href="/upload/note" className="hover:text-brand-600 transition-colors">Share Notes</Link>
          </nav>

          <p className="flex items-center gap-1 text-xs text-slate-400">
            Made with <Heart className="h-3 w-3 fill-red-400 text-red-400" /> for Mumbai students
          </p>
        </div>
      </div>
    </footer>
  );
}
