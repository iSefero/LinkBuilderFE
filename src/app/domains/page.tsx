import { Suspense } from "react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Header } from "@/components/layout/header";
import { DomainsTable } from "@/components/domains/domains-table";

export default function DomainsPage() {
  return (
    <AuthGuard>
      <Header />
      <main className="mx-auto w-full max-w-[100%] flex-1 px-4 py-4 md:px-6 md:py-6">
        <Suspense
          fallback={
            <div className="py-12 text-center text-muted-foreground">
              Загрузка...
            </div>
          }
        >
          <DomainsTable />
        </Suspense>
      </main>
    </AuthGuard>
  );
}
