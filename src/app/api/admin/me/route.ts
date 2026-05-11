import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/server/auth";

export async function GET() {
  const state = await getAuthState();
  return NextResponse.json({
    is_admin: state.is_admin,
    signed_in: state.signed_in,
  });
}

