import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";

const DEFAULT_ADMIN_EMAIL = "yoe.a.amai@gmail.com";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
  const adminEmail = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const isAdmin = email?.toLowerCase() === adminEmail.toLowerCase();

  const statCards = [
    { label: "Total Products", value: "8" },
    { label: "In Stock Products", value: "8" },
    { label: "Total Inquiries", value: "24" },
    { label: "Unresolved", value: "5" },
  ];

  if (!isAdmin) {
    return (
      <SiteShell>
        <section className="container py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="mb-3 text-2xl font-bold text-foreground">Access denied</h1>
            <p className="mb-6 text-muted">
              Your account is signed in but does not have admin access.
            </p>
            <Link
              href="/"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90"
            >
              Return home
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="container py-16">
        <h1 className="mb-10 text-4xl font-bold text-foreground">Admin Dashboard</h1>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-primary">{card.value}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Products Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-3 font-semibold">Product</th>
                  <th className="px-2 py-3 font-semibold">Category</th>
                  <th className="px-2 py-3 font-semibold">Price</th>
                  <th className="px-2 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-3">9x9 Clamshell Box</td>
                  <td className="px-2 py-3 text-muted">Bagasse</td>
                  <td className="px-2 py-3">$0.18</td>
                  <td className="px-2 py-3 text-primary">In Stock</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="px-2 py-3">16oz PLA Cold Cup</td>
                  <td className="px-2 py-3 text-muted">PLA</td>
                  <td className="px-2 py-3">$0.22</td>
                  <td className="px-2 py-3 text-primary">In Stock</td>
                </tr>
                <tr>
                  <td className="px-2 py-3">Kraft Paper Straws</td>
                  <td className="px-2 py-3 text-muted">Kraft Paper</td>
                  <td className="px-2 py-3">$1.45</td>
                  <td className="px-2 py-3 text-primary">In Stock</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

