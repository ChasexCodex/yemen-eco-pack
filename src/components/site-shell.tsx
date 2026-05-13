import { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Chatbot } from "./chatbot";

export function SiteShell({
  children,
  showFooterContactForm = true,
}: {
  children: ReactNode;
  showFooterContactForm?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter showContactForm={showFooterContactForm} />
      <Chatbot />
    </div>
  );
}
