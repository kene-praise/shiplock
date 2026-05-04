import { redirect } from "next/navigation";

// Root redirects to the default org
export default function RootPage() {
  redirect("/digitalencode/projects");
}
