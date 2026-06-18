"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

type DomainsPaginationProps = {
  page: number;
  pageSize: number;
  totalFiltered: number;
  totalAll: number;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function DomainsPagination({
  page,
  pageSize,
  totalFiltered,
  totalAll,
  hasActiveFilters,
  onPageChange,
  onPageSizeChange,
}: DomainsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rangeStart = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalFiltered);

  return (
    <div className="flex flex-col gap-3 border-t border-border/80 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {totalFiltered === 0 ? (
          <span>Записей не найдено</span>
        ) : (
          <span>
            Показано{" "}
            <span className="font-medium text-foreground">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            из{" "}
            <span className="font-medium text-foreground">{totalFiltered}</span>
            {hasActiveFilters && totalAll !== totalFiltered && (
              <>
                {" "}
                <span className="text-muted-foreground">
                  (всего {totalAll})
                </span>
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">На странице</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => v && onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <span className="text-sm">{pageSize}</span>
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[100px] text-center text-sm">
            {safePage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            aria-label="Следующая страница"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
