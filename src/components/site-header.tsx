"use client";

import Image from "next/image";
import Link from "next/link";
import { Show, UserButton, useClerk } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useLanguage, useSiteSettings, useTheme } from "@/components/app-providers";
import { Skeleton } from "@/components/skeleton";
import { useApiSWR } from "@/lib/swr";

const navItems = [
  { href: "/", key: "nav.home" },
  { href: "/products", key: "nav.products" },
  { href: "/materials", key: "nav.materials" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function SiteHeader() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { settings, settingsLoading } = useSiteSettings();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: adminStatus } = useApiSWR<{ is_admin: boolean; signed_in: boolean }>(
    "/api/admin/me",
    { shouldRetryOnError: false },
  );
  const isAdmin = adminStatus?.is_admin ?? false;

  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");
  const navLinks = (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium hover:text-primary"
          onClick={() => setMenuOpen(false)}
        >
          {t(item.key)}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {settingsLoading ? (
            <>
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-6 w-24" />
            </>
          ) : (
            <>
              <Image
                src={settings.logo_url}
                alt="BioPak logo"
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 rounded p-1 object-contain"
              />
              <span className="text-xl font-bold text-primary">BioPak</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks}
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-card"
          >
            {t("nav.language")}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-card"
            aria-label={t("nav.theme")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary">
              {t("nav.signIn")}
            </Link>
          </Show>
          <Show when="signed-in">
            <>
              {isAdmin ? (
                <Link href="/admin" className="text-sm font-medium hover:text-primary">
                  {t("nav.admin")}
                </Link>
              ) : null}
              <UserButton />
            </>
          </Show>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-lg border border-border px-2 py-1 text-sm"
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-border px-2 py-1 text-sm"
            aria-label={t("nav.theme")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
            aria-expanded={menuOpen}
          >
            {t("nav.menu")}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-4 py-5">
            {navLinks}
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-sm font-medium hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.signIn")}
              </Link>
            </Show>
            <Show when="signed-in">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-sm font-medium hover:text-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.admin")}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="text-start text-sm font-medium text-red-700"
              >
                {t("nav.signOut")}
              </button>
            </Show>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
