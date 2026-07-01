import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { getAdminSummary } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const summary = await getAdminSummary();
  return <AdminDashboard summary={summary} />;
}
