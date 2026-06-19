"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SortState = "none" | "asc" | "desc";

type SortableHeaderProps = {
  label: string;
  sort: SortState;
  onSort: () => void;
  allowNone?: boolean;
};

export function SortableHeader({
  label,
  sort,
  onSort,
  allowNone = true,
}: SortableHeaderProps) {
  const isActive = sort !== "none";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-full justify-start gap-1 px-0 font-medium",
        isActive
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onSort}
    >
      {label}
      {sort === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5" />
      ) : sort === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : (
        <ArrowUp className="h-3.5 w-3.5 opacity-25" />
      )}
    </Button>
  );
}

export function cycleSort(current: SortState): SortState {
  if (current === "none") return "asc";
  if (current === "asc") return "desc";
  return "none";
}

export function toggleDateSort(current: "asc" | "desc"): "asc" | "desc" {
  return current === "desc" ? "asc" : "desc";
}
