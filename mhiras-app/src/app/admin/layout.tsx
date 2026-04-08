import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-cream p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
