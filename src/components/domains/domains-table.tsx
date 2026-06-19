"use client";

import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { filterAndSortDomains } from "@/lib/domain-filters";
import { hasLinks, parseLinks } from "@/lib/links-helpers";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Status, type Domain } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import {
  useDeleteDomain,
  useDomains,
  useServers,
  useUpdateDomain,
  useUsers,
} from "@/hooks/use-api";
import { useDomainFilters } from "@/hooks/use-domain-filters";
import { toExternalUrl, toServerUrl } from "@/lib/url-helpers";
import { DomainFilters } from "./domain-filters";
import { CreateDomainModal } from "./create-domain-modal";
import { AddServerModal } from "./add-server-modal";
import {
  BulkDeleteDomainsDialog,
  DeleteDomainDialog,
  LinksEditModal,
  ResolveErrorDialog,
  TextEditModal,
} from "./domain-edit-modals";
import {
  BreakdownSelect,
  PrioritySelect,
  StatusSelect,
} from "./colored-selects";
import { SortableHeader, cycleSort } from "./sortable-header";
import { CellWithActions } from "./cell-with-actions";
import { DomainsPagination } from "./domains-pagination";
import { SearchableSelect } from "./searchable-select";

export function DomainsTable() {
  const { user } = useAuth();
  const { data: domains = [], isLoading } = useDomains();
  const { data: servers = [] } = useServers();
  const { data: users = [] } = useUsers();
  const updateDomain = useUpdateDomain();
  const deleteDomainMutation = useDeleteDomain();

  const {
    filters,
    setFilters,
    setPage,
    setPageSize,
    resetFilters,
    hasActiveFilters,
  } = useDomainFilters();
  const [createOpen, setCreateOpen] = useState(false);
  const [addServerOpen, setAddServerOpen] = useState(false);
  const [pendingServerDomainId, setPendingServerDomainId] = useState<
    string | null
  >(null);

  const [editDomain, setEditDomain] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [editLinks, setEditLinks] = useState<{
    id: string;
    links: string;
  } | null>(null);
  const [editError, setEditError] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [editVersion, setEditVersion] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const [resolveError, setResolveError] = useState<{
    id: string;
    newStatus: Status;
    errorMessage: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    domain: string;
  } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const responsibles = useMemo(
    () => [...new Set(users.map((u) => u.fullName).filter(Boolean))],
    [users],
  );

  const serverPorts = useMemo(() => servers.map((s) => s.port), [servers]);

  const filtered = useMemo(
    () => filterAndSortDomains(domains, filters),
    [domains, filters],
  );

  const totalFiltered = filtered.length;
  const totalAll = domains.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / filters.pageSize));
  const currentPage = Math.min(Math.max(1, filters.page), totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * filters.pageSize;
    return filtered.slice(start, start + filters.pageSize);
  }, [filtered, currentPage, filters.pageSize]);

  const canDeleteDomain = hasPermission(user, "domain", "delete");

  useEffect(() => {
    setRowSelection({});
  }, [
    currentPage,
    filters.pageSize,
    filters.search,
    filters.wmd,
    filters.priority,
    filters.breakdown,
    filters.responsible,
    filters.server,
    filters.status,
  ]);

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const patch = async (
    id: string,
    data: Parameters<typeof updateDomain.mutateAsync>[0]["data"],
  ) => {
    await updateDomain.mutateAsync({ id, data });
  };

  const handleStatusChange = async (domain: Domain, newStatus: Status) => {
    if (
      domain.status === Status.ERROR &&
      newStatus !== Status.ERROR &&
      domain.errorMessage
    ) {
      setResolveError({
        id: domain.id,
        newStatus,
        errorMessage: domain.errorMessage,
      });
      return;
    }
    await patch(domain.id, { status: newStatus });
  };

  const handleDeleteDomain = async () => {
    if (!deleteTarget) return;
    await deleteDomainMutation.mutateAsync(deleteTarget.id);
    const remaining = totalFiltered - 1;
    const newTotalPages = Math.max(1, Math.ceil(remaining / filters.pageSize));
    if (currentPage > newTotalPages) {
      setPage(newTotalPages);
    }
    setDeleteTarget(null);
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    if (ids.length === 0) return;
    await deleteDomainMutation.mutateAsync(ids);
    const remaining = totalFiltered - ids.length;
    const newTotalPages = Math.max(1, Math.ceil(remaining / filters.pageSize));
    if (currentPage > newTotalPages) {
      setPage(newTotalPages);
    }
    setRowSelection({});
    setBulkDeleteOpen(false);
  };

  const columns = useMemo<ColumnDef<Domain>[]>(
    () => [
      ...(canDeleteDomain
        ? [
            {
              id: "select",
              header: ({ table }) => (
                <div className="flex h-8 items-center justify-center">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(checked) =>
                      table.toggleAllPageRowsSelected(checked === true)
                    }
                  />
                </div>
              ),
              cell: ({ row }) => (
                <div className="flex h-8 items-center justify-center">
                  <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(checked) =>
                      row.toggleSelected(checked === true)
                    }
                  />
                </div>
              ),
              enableSorting: false,
            } satisfies ColumnDef<Domain>,
          ]
        : []),
      {
        accessorKey: "domain",
        header: "Домен",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "domain", "update");
          return (
            <CellWithActions
              actions={{
                value: d.domain,
                copyTitle: "Скопировать домен",
                href: toExternalUrl(d.domain),
                openTitle: "Открыть домен",
                onEdit: canUpdate
                  ? () => setEditDomain({ id: d.id, value: d.domain })
                  : undefined,
              }}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="block w-full min-w-20 max-w-[200px] truncate font-medium">
                      {d.domain}
                    </span>
                  }
                />
                <TooltipContent side="top" className="max-w-sm break-all">
                  {d.domain}
                </TooltipContent>
              </Tooltip>
            </CellWithActions>
          );
        },
      },
      {
        accessorKey: "wmd",
        header: () => (
          <div className="flex h-8 items-center justify-center text-sm font-medium">
            WMD
          </div>
        ),
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "wmd", "update");
          return (
            <div className="flex h-8 items-center justify-center">
              <Checkbox
                checked={d.wmd}
                disabled={!canUpdate || updateDomain.isPending}
                onCheckedChange={(checked) =>
                  patch(d.id, { wmd: checked === true })
                }
              />
            </div>
          );
        },
      },
      {
        accessorKey: "priority",
        header: () => (
          <SortableHeader
            label="Приоритет"
            sort={filters.prioritySort}
            onSort={() =>
              setFilters((f) => ({
                ...f,
                prioritySort: cycleSort(f.prioritySort),
              }))
            }
          />
        ),
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "priority", "update");
          return (
            <PrioritySelect
              value={d.priority}
              disabled={!canUpdate || updateDomain.isPending}
              onValueChange={(v) => patch(d.id, { priority: v })}
            />
          );
        },
      },
      {
        accessorKey: "breakdown",
        header: "Детализация",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "breakdown", "update");
          return (
            <BreakdownSelect
              value={d.breakdown}
              triggerBadgeClassName="w-full"
              disabled={!canUpdate || updateDomain.isPending}
              onValueChange={(v) => patch(d.id, { breakdown: v })}
            />
          );
        },
      },
      {
        accessorKey: "version",
        header: "Версия",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "domain", "update");
          return (
            <CellWithActions
              actions={{
                value: d.version || undefined,
                href: d.version ? toExternalUrl(d.version) : undefined,
                copyTitle: "Скопировать версию",
                openTitle: "Перейти к версии",
                onEdit: canUpdate
                  ? () => setEditVersion({ id: d.id, value: d.version })
                  : undefined,
              }}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="block max-w-[100px] truncate text-sm">
                      {d.version || "—"}
                    </span>
                  }
                />
                {d.version && (
                  <TooltipContent side="top" className="max-w-sm break-all">
                    {d.version}
                  </TooltipContent>
                )}
              </Tooltip>
            </CellWithActions>
          );
        },
      },
      {
        accessorKey: "links",
        header: "Доп. ссылки",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "links", "update");
          const parsed = parseLinks(d.links);
          return (
            <CellWithActions
              actions={
                canUpdate
                  ? {
                      onEdit: () => setEditLinks({ id: d.id, links: d.links }),
                    }
                  : undefined
              }
            >
              {hasLinks(d.links) ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="cursor-default text-sm underline decoration-dotted">
                        {parsed.length} шт.
                      </span>
                    }
                  />
                  <TooltipContent>
                    <ul className="max-w-xs space-y-1">
                      {parsed.map((l, i) => (
                        <li key={i} className="truncate text-xs">
                          {l}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </CellWithActions>
          );
        },
      },
      {
        accessorKey: "responsible",
        header: "Ответственный",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "responsible", "update");
          return (
            <Select
              value={d.responsible || "__empty"}
              disabled={!canUpdate || updateDomain.isPending}
              onValueChange={(v) =>
                v && patch(d.id, { responsible: v === "__empty" ? "" : v })
              }
            >
              <SelectTrigger className="h-8 w-[160px]">
                <span className="truncate text-sm">
                  {d.responsible || "Не назначен"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__empty">Не назначен</SelectItem>
                {responsibles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "server",
        header: () => (
          <div className="flex items-center gap-1">
            Сервер
            {hasPermission(user, "server", "create") && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6"
                title="Добавить сервер"
                onClick={() => setAddServerOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        ),
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "server", "update");
          return (
            <CellWithActions
              actions={
                d.server
                  ? {
                      value: d.server,
                      href: toServerUrl(d.server),
                      openTitle: "Перейти на сервер",
                    }
                  : undefined
              }
            >
              <SearchableSelect
                value={d.server || "__empty"}
                disabled={!canUpdate || updateDomain.isPending}
                onValueChange={(v) =>
                  patch(d.id, { server: v === "__empty" ? "" : v })
                }
                triggerClassName="w-[160px]"
                searchPlaceholder="Поиск сервера..."
                emptyMessage="Сервер не найден"
                options={[
                  { value: "__empty", label: "Не выбран" },
                  ...serverPorts.map((port) => ({
                    value: port,
                    label: port,
                  })),
                ]}
              />
            </CellWithActions>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Статус",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "status", "update");
          return (
            <StatusSelect
              value={d.status}
              disabled={!canUpdate || updateDomain.isPending}
              onValueChange={(v) => handleStatusChange(d, v)}
            />
          );
        },
      },
      {
        accessorKey: "errorMessage",
        header: "Проблема",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "errorMessage", "update");
          const canCreate = hasPermission(user, "errorMessage", "create");
          const canEdit = canUpdate || canCreate;
          return (
            <CellWithActions
              multiline
              actions={
                canEdit
                  ? {
                      onEdit: () =>
                        setEditError({
                          id: d.id,
                          value: d.errorMessage ?? "",
                        }),
                    }
                  : undefined
              }
            >
              {d.errorMessage ? (
                <span className="block max-w-[280px] min-w-60 break-words text-sm text-destructive">
                  {d.errorMessage}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </CellWithActions>
          );
        },
      },
      ...(canDeleteDomain
        ? [
            {
              id: "actions",
              header: () => <span className="sr-only">Действия</span>,
              cell: ({ row }: { row: { original: Domain } }) => {
                const d = row.original;
                return (
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              setDeleteTarget({ id: d.id, domain: d.domain })
                            }
                          />
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>Удалить домен</TooltipContent>
                    </Tooltip>
                  </div>
                );
              },
            } satisfies ColumnDef<Domain>,
          ]
        : []),
    ],
    [
      user,
      canDeleteDomain,
      responsibles,
      serverPorts,
      updateDomain.isPending,
      filters.prioritySort,
      filters.createdAtSort,
    ],
  );

  const table = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: canDeleteDomain,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  const canCreate = hasPermission(user, "domain", "create");

  const stickyHeadClass =
    "sticky top-0 z-50 bg-muted shadow-[inset_0_-1px_0_0_var(--border)]";

  const getStickyHeadClassForColumn = (columnId: string) => {
    if (columnId === "select") {
      return cn(
        stickyHeadClass,
        "sticky left-0 z-[65] w-10 min-w-10 px-0 text-center",
      );
    }
    if (columnId === "domain") {
      return cn(
        stickyHeadClass,
        "sticky top-0 z-[60] min-w-[220px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08),inset_-1px_0_0_0_var(--border),inset_0_-1px_0_0_var(--border)]",
        canDeleteDomain ? "left-10" : "left-0",
      );
    }
    return stickyHeadClass;
  };

  const getStickyCellClass = (columnId: string, isStriped: boolean) => {
    const bg = isStriped
      ? "bg-muted group-hover:bg-accent"
      : "bg-card group-hover:bg-accent";
    if (columnId === "select") {
      return cn("sticky left-0 z-20 w-10 min-w-10 px-0 text-center", bg);
    }
    if (columnId === "domain") {
      return cn(
        "sticky z-20 min-w-[220px] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]",
        canDeleteDomain ? "left-10" : "left-0",
        bg,
      );
    }
    return undefined;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-semibold">Домены</h1>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Добавить
          </Button>
        )}
      </div>

      <div className="shrink-0">
        <DomainFilters
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          responsibles={responsibles}
          servers={serverPorts}
          selectedCount={selectedCount}
          onBulkDelete={
            canDeleteDomain ? () => setBulkDeleteOpen(true) : undefined
          }
          onClearSelection={
            canDeleteDomain ? () => setRowSelection({}) : undefined
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <Table containerClassName="min-h-0 flex-1 overflow-auto overscroll-contain">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-b border-border/80 bg-muted hover:bg-muted"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={getStickyHeadClassForColumn(header.column.id)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Домены не найдены
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, index) => {
                const isStriped =
                  ((currentPage - 1) * filters.pageSize + index) % 2 === 1;
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(
                      "group",
                      isStriped
                        ? "bg-muted/25 hover:bg-muted/40"
                        : "hover:bg-muted/30",
                      row.getIsSelected() && "bg-primary/5 hover:bg-primary/10",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={getStickyCellClass(
                          cell.column.id,
                          isStriped,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className="shrink-0 border-t border-border/80">
          <DomainsPagination
            page={currentPage}
            pageSize={filters.pageSize}
            totalFiltered={totalFiltered}
            totalAll={totalAll}
            hasActiveFilters={hasActiveFilters}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <CreateDomainModal open={createOpen} onOpenChange={setCreateOpen} />

      <AddServerModal
        open={addServerOpen}
        onOpenChange={setAddServerOpen}
        onCreated={(port) => {
          if (pendingServerDomainId) {
            patch(pendingServerDomainId, { server: port });
            setPendingServerDomainId(null);
          }
        }}
      />

      {editDomain && (
        <TextEditModal
          open
          onOpenChange={(open) => !open && setEditDomain(null)}
          title="Редактировать домен"
          value={editDomain.value}
          placeholder="example.com"
          onSave={async (value) => {
            await patch(editDomain.id, { domain: value });
            setEditDomain(null);
          }}
        />
      )}

      {editVersion && (
        <TextEditModal
          open
          onOpenChange={(open) => !open && setEditVersion(null)}
          title="Редактировать версию"
          value={editVersion.value}
          placeholder="https://web.archive.org/web/..."
          onSave={async (value) => {
            await patch(editVersion.id, { version: value });
            setEditVersion(null);
          }}
        />
      )}

      {editLinks && (
        <LinksEditModal
          open
          onOpenChange={(open) => !open && setEditLinks(null)}
          links={editLinks.links}
          onSave={async (links) => {
            await patch(editLinks.id, { links });
            setEditLinks(null);
          }}
        />
      )}

      {editError && (
        <TextEditModal
          open
          onOpenChange={(open) => !open && setEditError(null)}
          title="Описание проблемы"
          value={editError.value}
          multiline
          placeholder="Опишите проблему с сайтом..."
          onSave={async (value) => {
            if (value.trim()) {
              await patch(editError.id, {
                errorMessage: value.trim(),
                status: Status.ERROR,
              });
            } else if (hasPermission(user, "errorMessage", "delete")) {
              await patch(editError.id, { errorMessage: undefined });
            }
            setEditError(null);
          }}
        />
      )}

      {resolveError && (
        <ResolveErrorDialog
          open
          onOpenChange={(open) => !open && setResolveError(null)}
          errorMessage={resolveError.errorMessage}
          onConfirm={async () => {
            await patch(resolveError.id, {
              status: resolveError.newStatus,
              errorMessage: undefined,
            });
            setResolveError(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteDomainDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          domainName={deleteTarget.domain}
          isPending={deleteDomainMutation.isPending}
          onConfirm={handleDeleteDomain}
        />
      )}

      {bulkDeleteOpen && (
        <BulkDeleteDomainsDialog
          open
          onOpenChange={setBulkDeleteOpen}
          count={selectedCount}
          isPending={deleteDomainMutation.isPending}
          onConfirm={handleBulkDelete}
        />
      )}
    </div>
  );
}
