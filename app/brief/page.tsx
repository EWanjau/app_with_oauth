import { auth0 } from "@/lib/auth0";
import { Outlook } from "@/components/outlook";
import { redirect } from "next/navigation";

export default async function BriefPage() {
  const session = await auth0.getSession();
  if (!session?.user) {
    redirect("/auth/login?returnTo=/brief");
  }

  const userName =
    session.user.name?.trim() ||
    session.user.nickname?.trim() ||
    session.user.email ||
    "there";

  return <Outlook userName={userName} />;
}
