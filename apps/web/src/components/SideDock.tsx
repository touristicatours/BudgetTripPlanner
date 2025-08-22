"use client";
import Link from "next/link";
import { Home, MessageCircle, Compass, Folder, Heart, Users } from "lucide-react";

export default function SideDock() {
  const Item = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/60 transition"
    >
      <Icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:block w-56 shrink-0 p-3 sticky top-16 self-start">
      <Item href="/" icon={Home} label="Home" />
      <Item href="/plan" icon={MessageCircle} label="Plan" />
      <Item href="/explore" icon={Compass} label="Explore" />
      <Item href="/trips" icon={Folder} label="Trips" />
      <Item href="/saved" icon={Heart} label="Saved" />
      <Item href="/community" icon={Users} label="Community" />
    </aside>
  );
}


