import { cn } from "@/lib/utils";
import {
  BREAKDOWN_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";
import { Breakdown, Priority, Status } from "@/lib/types";

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.MEDIUM]:
    "bg-amber-200 text-amber-950 border-amber-400 dark:bg-amber-600 dark:text-amber-50 dark:border-amber-500",
  [Priority.HIGH]:
    "bg-red-200 text-red-950 border-red-400 dark:bg-red-600 dark:text-red-50 dark:border-red-500",
};

export const BREAKDOWN_COLORS: Record<Breakdown, string> = {
  [Breakdown.STANDARD]:
    "bg-slate-200 text-slate-900 border-slate-400 dark:bg-slate-600 dark:text-slate-50 dark:border-slate-500",
  [Breakdown.MAXIMIZED]:
    "bg-blue-200 text-blue-950 border-blue-400 dark:bg-blue-600 dark:text-blue-50 dark:border-blue-500",
  [Breakdown.GENERATED]:
    "bg-violet-200 text-violet-950 border-violet-400 dark:bg-violet-600 dark:text-violet-50 dark:border-violet-500",
};

export const STATUS_COLORS: Record<Status, string> = {
  [Status.WAITING]:
    "bg-zinc-200 text-zinc-900 border-zinc-400 dark:bg-zinc-600 dark:text-zinc-50 dark:border-zinc-500",
  [Status.IN_PROGRESS]:
    "bg-sky-200 text-sky-950 border-sky-400 dark:bg-sky-600 dark:text-sky-50 dark:border-sky-500",
  [Status.READY_FOR_SERVER]:
    "bg-cyan-200 text-cyan-950 border-cyan-400 dark:bg-cyan-600 dark:text-cyan-50 dark:border-cyan-500",
  [Status.UPLOAD]:
    "bg-indigo-200 text-indigo-950 border-indigo-400 dark:bg-indigo-600 dark:text-indigo-50 dark:border-indigo-500",
  [Status.ERROR_WITH_SSL]:
    "bg-orange-200 text-orange-950 border-orange-400 dark:bg-orange-600 dark:text-orange-50 dark:border-orange-500",
  [Status.ERROR]:
    "bg-red-200 text-red-950 border-red-500 dark:bg-red-600 dark:text-red-50 dark:border-red-500",
  [Status.READY_FOR_PBN]:
    "bg-emerald-200 text-emerald-950 border-emerald-400 dark:bg-emerald-600 dark:text-emerald-50 dark:border-emerald-500",
  [Status.DONE]:
    "bg-green-200 text-green-950 border-green-500 dark:bg-green-600 dark:text-green-50 dark:border-green-500",
};

type BadgeProps = {
  className?: string;
};

export function PriorityBadge({
  value,
  className,
}: { value: Priority } & BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        PRIORITY_COLORS[value],
        className
      )}
    >
      {PRIORITY_LABELS[value]}
    </span>
  );
}

export function BreakdownBadge({
  value,
  className,
}: { value: Breakdown } & BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        BREAKDOWN_COLORS[value],
        className
      )}
    >
      {BREAKDOWN_LABELS[value]}
    </span>
  );
}

export function StatusBadge({
  value,
  className,
}: { value: Status } & BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        STATUS_COLORS[value],
        className
      )}
    >
      {STATUS_LABELS[value]}
    </span>
  );
}
