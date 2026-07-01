"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNav } from "@/lib/router";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full mix-blend-difference">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xs font-medium uppercase tracking-[0.3em] text-zinc-200 hover:text-accent transition-colors"
        >
          feli<span className="text-accent">7</span>xrescent
        </Link>
        <nav className="hidden items-center gap-6 sm:flex md:gap-8">
          {siteNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[10px] font-medium uppercase tracking-widest transition-colors ${
                active ? "text-accent" : "text-zinc-400 hover:text-accent"
              }`}
            >
              {item.label}
            </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
