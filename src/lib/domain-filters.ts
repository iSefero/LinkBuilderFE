import type { DomainFiltersState } from "@/components/domains/domain-filters";
import { Priority, type Domain } from "@/lib/types";

export type { DomainFiltersState } from "@/components/domains/domain-filters";
export { defaultFilters } from "@/components/domains/domain-filters";

const priorityOrder: Record<Priority, number> = {
  [Priority.MEDIUM]: 1,
  [Priority.HIGH]: 2,
};

export function filterAndSortDomains(
  domains: Domain[],
  filters: DomainFiltersState
): Domain[] {
  const result = domains.filter((d) => {
    if (
      filters.search &&
      !d.domain.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.wmd === "yes" && !d.wmd) return false;
    if (filters.wmd === "no" && d.wmd) return false;
    if (filters.priority !== "all" && d.priority !== filters.priority)
      return false;
    if (filters.breakdown.length > 0 && !filters.breakdown.includes(d.breakdown))
      return false;
    if (
      filters.responsible !== "all" &&
      d.responsible !== filters.responsible
    )
      return false;
    if (filters.server !== "all") {
      if (filters.server === "__empty" && d.server) return false;
      if (filters.server !== "__empty" && d.server !== filters.server) return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(d.status))
      return false;
    return true;
  });

  return [...result].sort((a, b) => {
    if (filters.prioritySort !== "none") {
      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return filters.prioritySort === "asc" ? diff : -diff;
    }

    const dateDiff =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return filters.createdAtSort === "asc" ? dateDiff : -dateDiff;
  });
}
