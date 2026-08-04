import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LogoutPage() {
  // Delete the administrative session cookie
  cookies().delete("borna_session");
  
  // Redirect back to login portal
  redirect("/login");
}
