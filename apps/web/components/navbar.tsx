"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { NavBar, Button } from "./ui";

const NAV = [
  { href: "/plan", label: "Plan Trip" },
  { href: "/chat", label: "AI Chat" },
  { href: "/maps", label: "Maps" },
  { href: "/explore", label: "Explore" },
  { href: "/trips", label: "My Trips" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const brand = (
    <Link href="/" className="flex items-center gap-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-primary text-white font-bold">
        TW
      </span>
      <span className="text-lg font-semibold tracking-tight">TripWeaver</span>
    </Link>
  );

  const navItems = NAV.map(item => ({
    label: item.label,
    href: item.href,
  }));

  const rightItems = (
    <div className="flex items-center gap-sm">
      {mounted && (
        <>
          {session ? (
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => signIn("google")}>
              Sign In
            </Button>
          )}
        </>
      )}
    </div>
  );

  return (
    <NavBar
      brand={brand}
      items={navItems}
      rightItems={rightItems}
    />
  );
}
