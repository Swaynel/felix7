"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideChrome && <SiteHeader />}
      <main>{children}</main>
      {!hideChrome && <SiteFooter />}
    </div>
  );
}
