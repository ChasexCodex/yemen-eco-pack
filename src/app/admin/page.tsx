import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { AdminDashboard } from "@/components/admin-dashboard";
import { resolveAdminEmail } from "@/lib/server/admin-config";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null;
  const isAdmin = email?.toLowerCase() === resolveAdminEmail();

  if (!isAdmin) {
    return (
      <SiteShell showFooterContactForm={false}>
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
    <SiteShell showFooterContactForm={false}>
      <AdminDashboard />
    </SiteShell>
  );
}
