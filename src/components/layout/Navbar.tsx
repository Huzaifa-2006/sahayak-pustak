"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Trophy, Star, Menu, X, Upload, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/books", label: "Books" },
  { href: "/notes", label: "Notes" },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Sahayak Pustak"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-display text-xl font-bold text-slate-900 hidden sm:block">
              Sahayak<span className="text-brand-600"> Pustak</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-8 w-24 skeleton" />
            ) : session ? (
              <>
                <div className="karma-badge">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{session.user.karmaPoints ?? 0} karma</span>
                </div>

                <Link href="/upload/book" className="btn-secondary text-xs px-3 py-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Link>

                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-slate-50 transition-colors">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">
                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {session.user.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/upload/book" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary w-full mt-2" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
