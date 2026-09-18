import { createServerClient } from "@/lib/supabase/createServerClient";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/signup");
}