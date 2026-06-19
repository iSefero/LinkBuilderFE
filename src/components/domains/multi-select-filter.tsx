"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  render?: React.ReactNode;
};

type MultiSelectFilterProps = {
  label: string;
  values: string[];
  options: MultiSelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function MultiSelectFilter({
  label,
  values,
  options,
  onChange,
  placeholder = "Все",
  className,
}: MultiSelectFilterProps) {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const selectedOptions = options.filter((o) => values.includes(o.value));
  const visible = selectedOptions.slice(0, 2);
  const hiddenCount = selectedOptions.length - visible.length;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-8 w-[200px] justify-between px-2.5 font-normal"
            />
          }
        >
          <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            {selectedOptions.length === 0 ? (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              <>
                {visible.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex max-w-[80px] shrink-0 truncate rounded bg-muted px-1.5 py-0.5 text-xs"
                  >
                    {opt.label}
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    +{hiddenCount}
                  </span>
                )}
              </>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent align="start" className="min-w-[200px] w-fit p-2">
          <div className="mb-2 flex items-center justify-between px-1 border-b border-border/80">
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            {values.length > 0 && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => onChange([])}
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
              >
                <Checkbox
                  checked={values.includes(opt.value)}
                  onCheckedChange={() => toggle(opt.value)}
                />
                <span className="flex-1 text-sm">
                  {opt.render ?? opt.label}
                </span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
