import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container grid gap-12 py-12 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-2xl font-bold">Contact Us</h3>
          <p className="mb-6 text-muted">
            Have a question or want to place a large order? Get in touch.
          </p>
          <form className="max-w-md space-y-4">
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2"
              placeholder="Name"
            />
            <input
              className="w-full rounded-lg border border-border bg-white px-3 py-2"
              placeholder="Email"
            />
            <textarea
              className="w-full rounded-lg border border-border bg-white px-3 py-2"
              rows={4}
              placeholder="Message"
            />
            <button className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground">
              Send Message
            </button>
          </form>
        </div>

        <div className="md:pl-12">
          <div className="mb-4 flex items-center gap-2">
            <img
              src="/logo.png"
              alt="BioPak"
              className="h-9 w-9 rounded bg-white p-1 object-contain"
            />
            <span className="text-2xl font-bold text-primary">BioPak</span>
          </div>
          <p className="mb-6 text-muted">
            Sustainable solutions for a greener Yemen.
          </p>
          <div className="mb-6 space-y-2">
            <p>
              <span className="font-semibold">Address:</span> Sana&apos;a, Yemen
            </p>
            <p>
              <span className="font-semibold">Email:</span> info@biopak.ye
            </p>
            <p>
              <span className="font-semibold">Phone:</span> +967-1-555-0100
            </p>
          </div>
          <div className="flex gap-4 text-sm text-muted">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <Link href="/materials" className="hover:text-primary">
              Materials
            </Link>
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="container border-t border-border/70 py-6 text-center text-sm text-muted">
        © 2024 BioPak. All rights reserved.
      </div>
    </footer>
  );
}

