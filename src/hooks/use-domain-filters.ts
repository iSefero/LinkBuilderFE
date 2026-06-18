"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  defaultFilters,
  type DomainFiltersState,
} from "@/components/domains/domain-filters";
import {
  filterCriteriaChanged,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/domain-filters-url";

export function useDomainFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams]
  );

  const pushFilters = useCallback(
    (resolved: DomainFiltersState) => {
      const params = filtersToSearchParams(resolved);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname]
  );

  const setFilters = useCallback(
    (
      next:
        | DomainFiltersState
        | ((prev: DomainFiltersState) => DomainFiltersState)
    ) => {
      const current = filtersFromSearchParams(searchParams);
      const resolved =
        typeof next === "function" ? next(current) : next;

      const final = filterCriteriaChanged(current, resolved)
        ? { ...resolved, page: 1 }
        : resolved;

      pushFilters(final);
    },
    [searchParams, pushFilters]
  );

  const setPage = useCallback(
    (page: number) => {
      setFilters((prev) => ({ ...prev, page: Math.max(1, page) }));
    },
    [setFilters]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
    },
    [setFilters]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== defaultFilters.search ||
      filters.wmd !== defaultFilters.wmd ||
      filters.priority !== defaultFilters.priority ||
      filters.breakdown.length > 0 ||
      filters.responsible !== defaultFilters.responsible ||
      filters.server !== defaultFilters.server ||
      filters.status.length > 0
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    setPage,
    setPageSize,
    resetFilters,
    hasActiveFilters,
  };
}
