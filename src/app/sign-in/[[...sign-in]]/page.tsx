import { SignIn } from "@clerk/nextjs";
import { SiteShell } from "@/components/site-shell";

export default function SignInPage() {
  return (
    <SiteShell>
      <section className="container flex min-h-[60vh] items-center justify-center py-20">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </section>
    </SiteShell>
  );
}

