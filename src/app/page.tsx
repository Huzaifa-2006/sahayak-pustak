import Link from "next/link";
import { BookOpen, FileText, Trophy, Star, ArrowRight, Users, BookMarked, Download } from "lucide-react";
import { db } from "@/lib/db";
import { books, notes, users } from "../../db/schema";
import { sql } from "drizzle-orm";

async function getStats() {
  const [bookCount] = await db.select({ count: sql<number>`count(*)` }).from(books);
  const [noteCount] = await db.select({ count: sql<number>`count(*)` }).from(notes);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [donatedCount] = await db.select({ count: sql<number>`count(*)` }).from(books).where(sql`is_donation = true`);
  return {
    books: Number(bookCount.count),
    notes: Number(noteCount.count),
    users: Number(userCount.count),
    donated: Number(donatedCount.count),
  };
}

export default async function HomePage() {
  let stats = { books: 0, notes: 0, users: 0, donated: 0 };
  try { stats = await getStats(); } catch (e) { /* DB unavailable — show zeros */ }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-pattern bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/5 via-transparent to-saffron-500/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-700 mb-6">
              <Star className="h-3.5 w-3.5 fill-current" />
              University of Mumbai · Central Railway Region
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Your Academic{" "}
              <span className="gradient-text">Community Hub</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Buy, sell, and donate textbooks. Share and download notes for free.
              Earn karma points for helping fellow Mumbai University students.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/books" className="btn-primary text-base px-7 py-3">
                Browse Books <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/notes" className="btn-secondary text-base px-7 py-3">
                Get Free Notes
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
            {[
              { label: "Books Listed", value: stats.books, icon: BookOpen },
              { label: "Books Donated", value: stats.donated, icon: BookMarked },
              { label: "Notes Shared", value: stats.notes, icon: FileText },
              { label: "Students", value: stats.users, icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="card p-4 text-center">
                <stat.icon className="h-5 w-5 text-brand-500 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Everything students need</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              A complete academic marketplace built by students, for students
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BookOpen,
                color: "bg-blue-50 text-blue-600",
                title: "Buy & Sell Books",
                desc: "Find affordable second-hand textbooks from seniors. List your old books and earn money.",
                href: "/books",
                cta: "Browse Books",
              },
              {
                icon: BookMarked,
                color: "bg-green-50 text-green-600",
                title: "Donate Books",
                desc: "Give back to the community by donating books you no longer need. Earn +300 karma points!",
                href: "/books/donations",
                cta: "See Donations",
              },
              {
                icon: FileText,
                color: "bg-purple-50 text-purple-600",
                title: "Free Notes",
                desc: "Upload and download PDF notes for free. Share your study material and earn +50 karma.",
                href: "/notes",
                cta: "Browse Notes",
              },
              {
                icon: Star,
                color: "bg-amber-50 text-amber-600",
                title: "Earn Karma",
                desc: "Contribute to the community and earn karma points. Climb the leaderboard.",
                href: "/leaderboard",
                cta: "View Leaderboard",
              },
              {
                icon: Trophy,
                color: "bg-orange-50 text-orange-600",
                title: "Leaderboard",
                desc: "Top contributors get recognized. See who's helping the most students this semester.",
                href: "/leaderboard",
                cta: "See Rankings",
              },
              {
                icon: Download,
                color: "bg-rose-50 text-rose-600",
                title: "Always Free Notes",
                desc: "Notes are always free to download. No premium tier, no paywalls for academic content.",
                href: "/notes",
                cta: "Download Now",
              },
            ].map((feature) => (
              <Link key={feature.title} href={feature.href} className="card p-6 group hover:-translate-y-0.5 transition-transform duration-200">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color} mb-4`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{feature.desc}</p>
                <span className="text-sm font-semibold text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  {feature.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Start contributing today
              </h2>
              <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of Mumbai University students sharing knowledge and helping each other succeed.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/upload/book" className="btn-saffron text-base px-7 py-3">
                  Donate a Book
                </Link>
                <Link href="/upload/note" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-7 py-3 text-base font-semibold text-white hover:bg-white/20 transition-colors">
                  Upload Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}