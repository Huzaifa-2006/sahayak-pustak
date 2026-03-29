import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserDashboard } from "@/actions/leaderboard";
import { getMyOrders } from "@/actions/orders";
import Image from "next/image";
import Link from "next/link";
import { Star, BookOpen, FileText, Trophy, Plus, BookMarked, Upload, ShoppingBag, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toRupees, ORDER_STATUS_LABELS } from "@/lib/stripe";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const [data, ordersData] = await Promise.all([
    getUserDashboard(session.user.id),
    getMyOrders(session.user.id),
  ]);
  if (!data) redirect("/auth/login");

  const { user, userBooks, userNotes, rank } = data;
  const { bought, sold } = ordersData;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-heading mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-6 text-center">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "User"} width={72} height={72} className="rounded-full mx-auto mb-4" />
            ) : (
              <div className="h-[72px] w-[72px] mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-brand-700">{user.name?.[0]?.toUpperCase() ?? "U"}</span>
              </div>
            )}
            <h2 className="font-display text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{user.email}</p>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-display text-2xl font-bold text-amber-700">{user.karmaPoints}</span>
              </div>
              <p className="text-xs text-amber-600 mt-0.5">Karma Points</p>
            </div>

            {rank > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
                <Trophy className="h-4 w-4 text-brand-500" />
                <span>Rank #{rank} on leaderboard</span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-display text-xl font-bold text-slate-900">{user.totalBooksDonated}</p>
                <p className="text-xs text-slate-500">Books Donated</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="font-display text-xl font-bold text-slate-900">{user.totalNotesUploaded}</p>
                <p className="text-xs text-slate-500">Notes Uploaded</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Member since {formatDate(user.createdAt)}</p>
          </div>

          {/* Quick Actions */}
          <div className="card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <Link href="/upload/book" className="btn-primary w-full text-sm py-2.5">
              <BookMarked className="h-4 w-4" /> Donate a Book (+300 karma)
            </Link>
            <Link href="/upload/book?sell=true" className="btn-secondary w-full text-sm py-2.5">
              <Plus className="h-4 w-4" /> List Book for Sale
            </Link>
            <Link href="/upload/note" className="btn-secondary w-full text-sm py-2.5">
              <Upload className="h-4 w-4" /> Upload Notes (+50 karma)
            </Link>
          </div>
        </div>

        {/* Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* My Purchases */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-500" /> My Purchases
              </h3>
            </div>
            {bought.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No purchases yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {bought.map((order) => {
                  const sm = ORDER_STATUS_LABELS[order.status];
                  return (
                    <Link key={order.id} href={`/orders/${order.id}`}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{order.book.title}</p>
                        <p className="text-xs text-slate-400">from {order.seller.name}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-bold text-slate-900">₹{toRupees(order.totalAmount)}</p>
                        <span className={`badge border text-[10px] ${sm?.color}`}>{sm?.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Sales */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-500" /> My Sales
              </h3>
            </div>
            {sold.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">No sales yet</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sold.map((order) => {
                  const sm = ORDER_STATUS_LABELS[order.status];
                  return (
                    <Link key={order.id} href={`/orders/${order.id}`}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{order.book.title}</p>
                        <p className="text-xs text-slate-400">to {order.buyer.name}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-bold text-green-600">+₹{toRupees(order.amount)}</p>
                        <span className={`badge border text-[10px] ${sm?.color}`}>{sm?.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Listings */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-500" /> My Book Listings
              </h3>
              <Link href="/upload/book" className="text-xs font-medium text-brand-600 hover:underline">+ Add New</Link>
            </div>
            {userBooks.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-200" />No books listed yet
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {userBooks.map((book) => (
                  <Link key={book.id} href={`/books/${book.id}`}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{book.title}</p>
                      <p className="text-xs text-slate-400">{book.subject} · Sem {book.semester}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(book.price)}</p>
                      {book.isDonation && <span className="text-[10px] font-semibold text-green-600 block">DONATED</span>}
                      {(book as any).isSold && <span className="text-[10px] font-semibold text-red-500 block">SOLD</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Notes */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" /> My Notes
              </h3>
              <Link href="/upload/note" className="text-xs font-medium text-brand-600 hover:underline">+ Upload</Link>
            </div>
            {userNotes.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <FileText className="h-8 w-8 mx-auto mb-2 text-slate-200" />No notes uploaded yet
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {userNotes.map((note) => (
                  <div key={note.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{note.title}</p>
                      <p className="text-xs text-slate-400">{note.subject} · Sem {note.semester}</p>
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">{note.downloadCount} downloads</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
