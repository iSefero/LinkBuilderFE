"use client";

import { useCallback } from "react";
import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { BREAKDOWN_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Breakdown, Priority, Status } from "@/lib/types";
import {
  arrayEquals,
  useDebouncedFilterField,
} from "@/hooks/use-debounced-filter";
import { PriorityFilterSelect } from "./colored-selects";
import { MultiSelectFilter } from "./multi-select-filter";
import { SearchableSelect } from "./searchable-select";
import { BreakdownBadge, StatusBadge } from "./enum-badges";

export type DomainFiltersState = {
  search: string;
  wmd: "all" | "yes" | "no";
  priority: Priority | "all";
  breakdown: Breakdown[];
  responsible: string;
  server: string;
  status: Status[];
  prioritySort: "none" | "asc" | "desc";
  createdAtSort: "asc" | "desc";
  page: number;
  pageSize: number;
};

export const defaultFilters: DomainFiltersState = {
  search: "",
  wmd: "all",
  priority: "all",
  breakdown: [],
  responsible: "all",
  server: "all",
  status: [],
  prioritySort: "none",
  createdAtSort: "desc",
  page: 1,
  pageSize: 25,
};

type DomainFiltersProps = {
  filters: DomainFiltersState;
  onChange: (
    next:
      | DomainFiltersState
      | ((prev: DomainFiltersState) => DomainFiltersState),
  ) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  responsibles: string[];
  servers: string[];
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
};

const WMD_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" },
] as const;

const BREAKDOWN_OPTIONS = (Object.keys(BREAKDOWN_LABELS) as Breakdown[]).map(
  (value) => ({
    value,
    label: BREAKDOWN_LABELS[value],
    render: <BreakdownBadge className="w-full" value={value} />,
  }),
);

const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as Status[]).map(
  (value) => ({
    value,
    label: STATUS_LABELS[value],
    render: <StatusBadge className="w-full" value={value} />,
  }),
);

export function DomainFilters({
  filters,
  onChange,
  onReset,
  hasActiveFilters,
  responsibles,
  servers,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
}: DomainFiltersProps) {
  const showBulkActions = Boolean(onBulkDelete && onClearSelection);
  const set = (patch: Partial<DomainFiltersState>) =>
    onChange({ ...filters, ...patch });

  const applySearch = useCallback(
    (search: string) => onChange((prev) => ({ ...prev, search })),
    [onChange],
  );
  const applyBreakdown = useCallback(
    (breakdown: Breakdown[]) => onChange((prev) => ({ ...prev, breakdown })),
    [onChange],
  );
  const applyStatus = useCallback(
    (status: Status[]) => onChange((prev) => ({ ...prev, status })),
    [onChange],
  );

  const [searchDraft, setSearchDraft] = useDebouncedFilterField(
    filters.search,
    applySearch,
  );
  const [breakdownDraft, setBreakdownDraft] = useDebouncedFilterField(
    filters.breakdown,
    applyBreakdown,
    arrayEquals,
  );
  const [statusDraft, setStatusDraft] = useDebouncedFilterField(
    filters.status,
    applyStatus,
    arrayEquals,
  );

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Поиск по домену
              </label>
              <div className="relative">
                <Search className="absolute top-2 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="example.com"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="outline"
              disabled={!hasActiveFilters}
              className="border-orange-200 bg-orange-50 text-orange-700 shadow-sm hover:bg-orange-100 hover:text-orange-800 disabled:opacity-40 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/70"
              onClick={onReset}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Сбросить фильтры
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <FilterSelect
              label="WMD"
              value={filters.wmd}
              onValueChange={(v) =>
                set({ wmd: v as DomainFiltersState["wmd"] })
              }
              options={WMD_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Приоритет
              </label>
              <PriorityFilterSelect
                value={filters.priority}
                onValueChange={(v) => set({ priority: v })}
              />
            </div>

            <MultiSelectFilter
              label="Детализация"
              values={breakdownDraft}
              options={BREAKDOWN_OPTIONS}
              onChange={(breakdown) =>
                setBreakdownDraft(breakdown as Breakdown[])
              }
            />

            <FilterSelect
              label="Ответственный"
              value={filters.responsible}
              onValueChange={(v) => set({ responsible: v })}
              options={[
                { value: "all", label: "Все" },
                ...responsibles.map((r) => ({ value: r, label: r })),
              ]}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Сервер
              </label>
              <SearchableSelect
                value={filters.server}
                onValueChange={(v) => set({ server: v })}
                triggerClassName="w-[200px]"
                searchPlaceholder="Поиск сервера..."
                emptyMessage="Сервер не найден"
                options={[
                  { value: "all", label: "Все" },
                  { value: "__empty", label: "Без сервера" },
                  ...servers.map((s) => ({ value: s, label: s })),
                ]}
              />
            </div>

            <MultiSelectFilter
              label="Статус"
              values={statusDraft}
              options={STATUS_OPTIONS}
              onChange={(status) => setStatusDraft(status as Status[])}
            />
          </div>
        </div>

        {showBulkActions && (
          <div className="flex w-[220px] shrink-0 flex-col justify-end gap-2 border-l border-border/60 pl-4">
            <span
              className={
                selectedCount > 0
                  ? "text-sm font-medium"
                  : "text-sm text-muted-foreground"
              }
            >
              Выбрано: {selectedCount}
            </span>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedCount === 0}
              onClick={onBulkDelete}
            >
              Удалить выбранные
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedCount === 0}
              onClick={onClearSelection}
            >
              Снять выбор
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select
        value={value as string}
        onValueChange={(v) => v && onValueChange(v)}
      >
        <SelectTrigger className="w-[150px]">
          <span className="truncate text-sm">{selected?.label ?? "—"}</span>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
