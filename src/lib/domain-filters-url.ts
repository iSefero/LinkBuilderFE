import {
  defaultFilters,
  type DomainFiltersState,
} from "@/components/domains/domain-filters";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/components/domains/domains-pagination";
import { Breakdown, Priority, Status } from "@/lib/types";

const BREAKDOWN_VALUES = new Set(Object.values(Breakdown));
const STATUS_VALUES = new Set(Object.values(Status));
const PRIORITY_VALUES = new Set(Object.values(Priority));

function parseList<T extends string>(value: string | null, allowed: Set<T>): T[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is T => allowed.has(item as T));
}

export function filtersFromSearchParams(
  params: URLSearchParams
): DomainFiltersState {
  const priority = params.get("priority");
  const wmd = params.get("wmd");

  return {
    search: params.get("q") ?? "",
    wmd: wmd === "yes" || wmd === "no" ? wmd : "all",
    priority:
      priority && PRIORITY_VALUES.has(priority as Priority)
        ? (priority as Priority)
        : "all",
    breakdown: parseList(params.get("breakdown"), BREAKDOWN_VALUES),
    responsible: params.get("responsible") ?? "all",
    server: params.get("server") ?? "all",
    status: parseList(params.get("status"), STATUS_VALUES),
    prioritySort:
      params.get("psort") === "asc" || params.get("psort") === "desc"
        ? (params.get("psort") as "asc" | "desc")
        : "none",
    createdAtSort: params.get("csort") === "asc" ? "asc" : "desc",
    page: Math.max(1, Number(params.get("page")) || 1),
    pageSize: parsePageSize(params.get("limit")),
  };
}

function parsePageSize(value: string | null): number {
  const num = Number(value);
  if (PAGE_SIZE_OPTIONS.includes(num as (typeof PAGE_SIZE_OPTIONS)[number])) {
    return num;
  }
  return DEFAULT_PAGE_SIZE;
}

export function filtersToSearchParams(filters: DomainFiltersState): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.wmd !== "all") params.set("wmd", filters.wmd);
  if (filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.breakdown.length > 0) {
    params.set("breakdown", filters.breakdown.join(","));
  }
  if (filters.responsible !== "all") {
    params.set("responsible", filters.responsible);
  }
  if (filters.server !== "all") params.set("server", filters.server);
  if (filters.status.length > 0) params.set("status", filters.status.join(","));
  if (filters.prioritySort !== defaultFilters.prioritySort) {
    params.set("psort", filters.prioritySort);
  }
  if (filters.createdAtSort !== defaultFilters.createdAtSort) {
    params.set("csort", filters.createdAtSort);
  }
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("limit", String(filters.pageSize));
  }

  return params;
}

const FILTER_CRITERIA_KEYS = [
  "search",
  "wmd",
  "priority",
  "breakdown",
  "responsible",
  "server",
  "status",
  "prioritySort",
  "createdAtSort",
] as const;

export function filterCriteriaChanged(
  prev: DomainFiltersState,
  next: DomainFiltersState
): boolean {
  return FILTER_CRITERIA_KEYS.some((key) => {
    if (key === "breakdown" || key === "status") {
      return (
        JSON.stringify(prev[key]) !== JSON.stringify(next[key])
      );
    }
    return prev[key] !== next[key];
  });
}

export function filtersEqual(a: DomainFiltersState, b: DomainFiltersState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
