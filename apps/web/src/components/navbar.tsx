"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold">TW</span>
          <span className="text-lg font-semibold tracking-tight">TripWeaver</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/trips" className="hover:text-indigo-600 transition-colors">My Trips</Link>
          <Link href="/#features" className="hover:text-indigo-600 transition-colors">Features</Link>
          <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/plan" className="rounded-lg px-3 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">Plan a Trip</Link>
          <Link href="/demo" className="rounded-lg px-3 py-2 text-sm font-medium border border-black/10 bg-white hover:bg-black/5">Demo</Link>
          {mounted && (
            <>
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="rounded-lg px-3 py-2 text-sm font-medium border border-black/10 bg-white hover:bg-black/5"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="rounded-lg px-3 py-2 text-sm font-medium border border-black/10 bg-white hover:bg-black/5"
                >
                  Sign In
                </button>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
