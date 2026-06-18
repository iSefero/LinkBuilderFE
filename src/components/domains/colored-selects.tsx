"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  BreakdownBadge,
  PriorityBadge,
  StatusBadge,
} from "./enum-badges";
import { Breakdown, Priority, Status } from "@/lib/types";
import {
  BREAKDOWN_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/constants";

type SelectBaseProps = {
  disabled?: boolean;
  className?: string;
};

export function PrioritySelect({
  value,
  onValueChange,
  disabled,
  className,
}: {
  value: Priority;
  onValueChange: (value: Priority) => void;
} & SelectBaseProps) {
  return (
    <Select
      value={value as string}
      disabled={disabled}
      onValueChange={(v) => v && onValueChange(v as Priority)}
    >
      <SelectTrigger className={cn("h-8 w-[130px] border-0 bg-transparent p-0 shadow-none", className)}>
        <PriorityBadge value={value} />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(PRIORITY_LABELS) as Priority[]).map((key) => (
          <SelectItem key={key} value={key}>
            <PriorityBadge value={key} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function BreakdownSelect({
  value,
  onValueChange,
  disabled,
  className,
}: {
  value: Breakdown;
  onValueChange: (value: Breakdown) => void;
} & SelectBaseProps) {
  return (
    <Select
      value={value as string}
      disabled={disabled}
      onValueChange={(v) => v && onValueChange(v as Breakdown)}
    >
      <SelectTrigger className={cn("h-8 w-[140px] border-0 bg-transparent p-0 shadow-none", className)}>
        <BreakdownBadge value={value} />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(BREAKDOWN_LABELS) as Breakdown[]).map((key) => (
          <SelectItem key={key} value={key}>
            <BreakdownBadge value={key} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StatusSelect({
  value,
  onValueChange,
  disabled,
  className,
}: {
  value: Status;
  onValueChange: (value: Status) => void;
} & SelectBaseProps) {
  return (
    <Select
      value={value as string}
      disabled={disabled}
      onValueChange={(v) => v && onValueChange(v as Status)}
    >
      <SelectTrigger className={cn("h-8 w-[160px] border-0 bg-transparent p-0 shadow-none", className)}>
        <StatusBadge value={value} />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as Status[]).map((key) => (
          <SelectItem key={key} value={key}>
            <StatusBadge value={key} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PriorityFilterSelect({
  value,
  onValueChange,
}: {
  value: Priority | "all";
  onValueChange: (value: Priority | "all") => void;
}) {
  return (
    <Select
      value={value as string}
      onValueChange={(v) => v && onValueChange(v as Priority | "all")}
    >
      <SelectTrigger className="w-[140px]">
        {value === "all" ? (
          <span className="text-sm">Все</span>
        ) : (
          <PriorityBadge value={value} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все</SelectItem>
        {(Object.keys(PRIORITY_LABELS) as Priority[]).map((key) => (
          <SelectItem key={key} value={key}>
            <PriorityBadge value={key} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function BreakdownFilterSelect({
  value,
  onValueChange,
}: {
  value: Breakdown | "all";
  onValueChange: (value: Breakdown | "all") => void;
}) {
  return (
    <Select
      value={value as string}
      onValueChange={(v) => v && onValueChange(v as Breakdown | "all")}
    >
      <SelectTrigger className="w-[150px]">
        {value === "all" ? (
          <span className="text-sm">Все</span>
        ) : (
          <BreakdownBadge value={value} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все</SelectItem>
        {(Object.keys(BREAKDOWN_LABELS) as Breakdown[]).map((key) => (
          <SelectItem key={key} value={key}>
            <BreakdownBadge value={key} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StatusFilterSelect({
  value,
  onValueChange,
}: {
  value: Status | "all";
  onValueChange: (value: Status | "all") => void;
}) {
  return (
    <Select
      value={value as string}
      onValueChange={(v) => v && onValueChange(v as Status | "all")}
    >
      <SelectTrigger className="w-[160px]">
        {value === "all" ? (
          <span className="text-sm">Все</span>
        ) : (
          <StatusBadge value={value} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Все</SelectItem>
        {(Object.keys(STATUS_LABELS) as Status[]).map((key) => (
          <SelectItem key={key} value={key}>
            <StatusBadge value={key} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
