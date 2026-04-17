import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user's role to redirect to the correct dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "student";

        switch (role) {
          case "tutor":
            return NextResponse.redirect(`${origin}/tutor-dashboard`);
          case "admin":
            return NextResponse.redirect(`${origin}/admin-dashboard`);
          default:
            return NextResponse.redirect(`${origin}/dashboard`);
        }
      }
    }
  }

  // Fallback: redirect to login on error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}


