import { redirect } from "next/navigation";

export default function StaffDashboardIndexRedirect() {
  redirect("/internal/dashboard");
}
