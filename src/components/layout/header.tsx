"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { ProfileDialog } from "./profile-dialog";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[100%] items-center justify-between px-4 xl:px-6">
        <nav className="flex items-center gap-1">
          <Link
            href="/domains"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              pathname === "/domains" && "bg-muted"
            )}
          >
            Домены
          </Link>
          <Link
            href="/users"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              pathname === "/users" && "bg-muted"
            )}
          >
            <Users className="h-4 w-4" />
            Пользователи
          </Link>
        </nav>

        <ProfileDialog />
      </div>
    </header>
  );
}
