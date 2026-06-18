import { AuthGuard } from "@/components/layout/auth-guard";
import { Header } from "@/components/layout/header";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <AuthGuard>
      <Header />
      <main className="mx-auto w-full max-w-[100%] flex-1 px-4 py-4 md:px-6 md:py-6">
        <UsersTable />
      </main>
    </AuthGuard>
  );
}
