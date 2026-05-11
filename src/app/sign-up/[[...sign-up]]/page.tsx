import { SignUp } from "@clerk/nextjs";
import { SiteShell } from "@/components/site-shell";

export default function SignUpPage() {
  return (
    <SiteShell>
      <section className="container flex min-h-[60vh] items-center justify-center py-20">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      </section>
    </SiteShell>
  );
}

