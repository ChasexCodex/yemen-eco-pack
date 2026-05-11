import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/materials", label: "Materials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="BioPak logo"
            className="h-8 w-8 rounded bg-white p-1 object-contain"
          />
          <span className="text-xl font-bold text-primary">BioPak</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary">
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <>
              <Link href="/admin" className="text-sm font-medium hover:text-primary">
                Admin
              </Link>
              <UserButton />
            </>
          </Show>
        </nav>
      </div>
    </header>
  );
}

