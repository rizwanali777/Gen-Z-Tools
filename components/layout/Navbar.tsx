"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/tools-registry";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const platform = navigator.platform || "";
    if (/Mac|iPhone|iPad/.test(platform)) setShortcut("⌘K");
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="glass sticky top-0 z-40 border-b border-white/40 dark:border-white/10">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center rounded-md" aria-label={siteConfig.name}>
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Categories">
          {categories.map((category) => {
            const active = pathname === category.href || pathname.startsWith(`${category.href}/`);
            return (
              <Link
                key={category.slug}
                href={category.href}
                className={cn(
                  "rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground",
                  active && "bg-accent text-foreground",
                )}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="glass-inset ml-auto hidden h-9 min-w-44 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground sm:flex"
        >
          <Search className="size-4" aria-hidden />
          <span className="flex-1 text-left">Search tools</span>
          <kbd className="glass-inset rounded border px-1.5 py-0.5 font-mono text-[10px]">{shortcut}</kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto sm:hidden"
          aria-label="Search tools"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle color theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>
      {menuOpen ? (
        <nav className="border-t px-4 py-2 lg:hidden" aria-label="Categories">
          <ul className="grid gap-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={category.href} className="block rounded-md px-2 py-2 text-sm hover:bg-accent">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

