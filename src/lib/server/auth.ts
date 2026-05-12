import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DEFAULT_ADMIN_EMAIL = "elaf.a.amri@gmail.com";

type AuthState = {
  signed_in: boolean;
  is_admin: boolean;
  email: string | null;
};

function resolveAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export async function getAuthState(): Promise<AuthState> {
  const { userId } = await auth();
  if (!userId) {
    return {
      signed_in: false,
      is_admin: false,
      email: null,
    };
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;

  const isAdmin = email ? email.toLowerCase() === resolveAdminEmail() : false;

  return {
    signed_in: true,
    is_admin: isAdmin,
    email,
  };
}

export async function requireAdminApi(): Promise<NextResponse | null> {
  const state = await getAuthState();
  if (!state.signed_in) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!state.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}

