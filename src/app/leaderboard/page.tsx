import { getLeaderboard } from "@/actions/leaderboard";
import Image from "next/image";
import { Trophy, Star, BookMarked, FileText, Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Karma Leaderboard" };

const podiumColors = [
  { border: "border-karma-gold", bg: "bg-amber-50", text: "text-amber-700", icon: Crown },
  { border: "border-karma-silver", bg: "bg-slate-50", text: "text-slate-500", icon: Medal },
  { border: "border-karma-bronze", bg: "bg-orange-50", text: "text-orange-600", icon: Medal },
];

interface LeaderboardPageProps {
  searchParams: { page?: string };
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const page = Number(searchParams.page ?? 1);
  const users = await getLeaderboard(page, 20);

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);
  const startRank = (page - 1) * 20 + 1;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 mb-4">
          <Trophy className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="section-heading">Karma Leaderboard</h1>
        <p className="text-slate-500 mt-2">
          Top contributors at University of Mumbai
        </p>
      </div>

      {/* Karma Info */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-green-600">+300</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
            <BookMarked className="h-3 w-3" />
            per book donation
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-purple-600">+50</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
            <FileText className="h-3 w-3" />
            per notes upload
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {page === 1 && topThree.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd */}
          {topThree[1] && (
            <div className={cn("flex-1 card border-2 p-4 text-center", podiumColors[1].border)}>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-sm font-bold mb-2 mx-auto">2</div>
              <UserAvatar user={topThree[1]} size="sm" />
              <p className="font-semibold text-slate-900 text-sm mt-2 truncate">{topThree[1].name}</p>
              <p className={cn("font-bold text-base mt-1", podiumColors[1].text)}>
                <Star className="h-3.5 w-3.5 inline mr-0.5 fill-current" />
                {topThree[1].karmaPoints}
              </p>
            </div>
          )}

          {/* 1st */}
          {topThree[0] && (
            <div className={cn("flex-1 card border-2 p-5 text-center", podiumColors[0].border)}>
              <Crown className="h-6 w-6 text-karma-gold mx-auto mb-2" />
              <UserAvatar user={topThree[0]} size="md" />
              <p className="font-semibold text-slate-900 text-sm mt-2 truncate">{topThree[0].name}</p>
              <p className={cn("font-bold text-lg mt-1", podiumColors[0].text)}>
                <Star className="h-4 w-4 inline mr-0.5 fill-current" />
                {topThree[0].karmaPoints}
              </p>
            </div>
          )}

          {/* 3rd */}
          {topThree[2] && (
            <div className={cn("flex-1 card border-2 p-4 text-center", podiumColors[2].border)}>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500 text-sm font-bold mb-2 mx-auto">3</div>
              <UserAvatar user={topThree[2]} size="sm" />
              <p className="font-semibold text-slate-900 text-sm mt-2 truncate">{topThree[2].name}</p>
              <p className={cn("font-bold text-base mt-1", podiumColors[2].text)}>
                <Star className="h-3.5 w-3.5 inline mr-0.5 fill-current" />
                {topThree[2].karmaPoints}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Full Table */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map((user, i) => {
            const rank = startRank + i;
            return (
              <div key={user.id} className={cn(
                "flex items-center gap-4 p-4 transition-colors hover:bg-slate-50",
                rank <= 3 && page === 1 && "bg-amber-50/30"
              )}>
                {/* Rank */}
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  rank === 1 ? "bg-amber-100 text-amber-700" :
                  rank === 2 ? "bg-slate-100 text-slate-500" :
                  rank === 3 ? "bg-orange-100 text-orange-600" :
                  "bg-slate-50 text-slate-400"
                )}>
                  {rank}
                </div>

                {/* User */}
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{user.name ?? "Anonymous"}</p>
                  <p className="text-xs text-slate-400">
                    {user.totalBooksDonated} donations · {user.totalNotesUploaded} notes
                  </p>
                </div>

                {/* Karma */}
                <div className="karma-badge">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{user.karmaPoints}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3 mt-8">
        {page > 1 && (
          <Link href={`/leaderboard?page=${page - 1}`} className="btn-secondary">
            ← Previous
          </Link>
        )}
        {users.length === 20 && (
          <Link href={`/leaderboard?page=${page + 1}`} className="btn-secondary">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}

function UserAvatar({ user, size = "sm" }: { user: { name?: string | null; image?: string | null }; size?: "sm" | "md" }) {
  const dim = size === "md" ? 48 : 36;
  const cls = size === "md" ? "h-12 w-12" : "h-9 w-9";
  const textCls = size === "md" ? "text-lg" : "text-sm";

  return user.image ? (
    <Image
      src={user.image}
      alt={user.name ?? "User"}
      width={dim}
      height={dim}
      className={cn(cls, "rounded-full object-cover shrink-0")}
    />
  ) : (
    <div className={cn(cls, "shrink-0 rounded-full bg-brand-100 flex items-center justify-center")}>
      <span className={cn(textCls, "font-bold text-brand-700")}>
        {user.name?.[0]?.toUpperCase() ?? "U"}
      </span>
    </div>
  );
}
