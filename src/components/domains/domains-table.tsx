"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Pencil, Plus } from "lucide-react";
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
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Breakdown, Priority, Status, type Domain } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import {
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
  LinksEditModal,
  ResolveErrorDialog,
  TextEditModal,
} from "./domain-edit-modals";
import {
  BreakdownSelect,
  PrioritySelect,
  StatusSelect,
} from "./colored-selects";
import { SortableHeader, cycleSort, toggleDateSort } from "./sortable-header";
import { CopyLinkActions } from "./copy-link-actions";
import { DomainsPagination } from "./domains-pagination";

export function DomainsTable() {
  const { user } = useAuth();
  const { data: domains = [], isLoading } = useDomains();
  const { data: servers = [] } = useServers();
  const { data: users = [] } = useUsers();
  const updateDomain = useUpdateDomain();

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
    links: string[];
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

  const columns = useMemo<ColumnDef<Domain>[]>(
    () => [
      {
        accessorKey: "domain",
        header: "Домен",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "domain", "update");
          return (
            <CellWithEdit
              canEdit={canUpdate}
              onEdit={() => setEditDomain({ id: d.id, value: d.domain })}
            >
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="max-w-[200px] min-w-20 truncate font-medium">
                        {d.domain}
                      </span>
                    }
                  />
                  <TooltipContent side="top" className="max-w-sm break-all">
                    {d.domain}
                  </TooltipContent>
                </Tooltip>
                <CopyLinkActions
                  value={d.domain}
                  copyTitle="Скопировать домен"
                />
              </div>
            </CellWithEdit>
          );
        },
      },
      {
        accessorKey: "wmd",
        header: "WMD",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "wmd", "update");
          return (
            <Checkbox
              checked={d.wmd}
              disabled={!canUpdate || updateDomain.isPending}
              onCheckedChange={(checked) =>
                patch(d.id, { wmd: checked === true })
              }
            />
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
            <CellWithEdit
              canEdit={canUpdate}
              onEdit={() => setEditVersion({ id: d.id, value: d.version })}
            >
              <div className="flex items-start min-w-50 gap-0.5">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="block max-w-[200px] truncate text-sm">
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
                {d.version && (
                  <CopyLinkActions
                    value={d.version}
                    href={toExternalUrl(d.version)}
                    copyTitle="Скопировать версию"
                    openTitle="Перейти к версии"
                  />
                )}
              </div>
            </CellWithEdit>
          );
        },
      },
      {
        accessorKey: "links",
        header: "Доп. ссылки",
        cell: ({ row }) => {
          const d = row.original;
          const canUpdate = hasPermission(user, "links", "update");
          return (
            <CellWithEdit
              canEdit={canUpdate}
              onEdit={() => setEditLinks({ id: d.id, links: d.links })}
            >
              {d.links.length > 0 ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="cursor-default text-sm underline decoration-dotted">
                        {d.links.length} шт.
                      </span>
                    }
                  />
                  <TooltipContent>
                    <ul className="max-w-xs space-y-1">
                      {d.links.map((l, i) => (
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
            </CellWithEdit>
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
            <div className="flex items-center gap-0.5">
              <Select
                value={d.server || "__empty"}
                disabled={!canUpdate || updateDomain.isPending}
                onValueChange={(v) =>
                  v && patch(d.id, { server: v === "__empty" ? "" : v })
                }
              >
                <SelectTrigger className="h-8 w-[160px]">
                  <span className="truncate text-sm">
                    {d.server || "Не выбран"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__empty">Не выбран</SelectItem>
                  {serverPorts.map((port) => (
                    <SelectItem key={port} value={port}>
                      {port}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {d.server && (
                <CopyLinkActions
                  value={d.server}
                  href={toServerUrl(d.server)}
                  openTitle="Перейти на сервер"
                />
              )}
            </div>
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
            <CellWithEdit
              canEdit={canEdit}
              multiline
              onEdit={() =>
                setEditError({ id: d.id, value: d.errorMessage ?? "" })
              }
            >
              {d.errorMessage ? (
                <span className="block max-w-[280px] min-w-60 break-words text-sm text-destructive">
                  {d.errorMessage}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </CellWithEdit>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <SortableHeader
            label="Создано"
            sort={
              filters.prioritySort !== "none" ? "none" : filters.createdAtSort
            }
            allowNone={false}
            onSort={() =>
              setFilters((f) => ({
                ...f,
                prioritySort: "none",
                createdAtSort: toggleDateSort(f.createdAtSort),
              }))
            }
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {format(new Date(row.original.createdAt), "dd.MM.yyyy", {
              locale: ru,
            })}
          </span>
        ),
      },
    ],
    [
      user,
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
  });

  const canCreate = hasPermission(user, "domain", "create");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Домены</h1>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Добавить
          </Button>
        )}
      </div>

      <DomainFilters
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
        responsibles={responsibles}
        servers={serverPorts}
      />

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="border-b border-border/80 bg-muted/70 hover:bg-muted/70"
              >
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={
                    ((currentPage - 1) * filters.pageSize + index) % 2 === 1
                      ? "bg-muted/25 hover:bg-muted/40"
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}

function CellWithEdit({
  children,
  canEdit,
  onEdit,
  multiline,
}: {
  children: React.ReactNode;
  canEdit: boolean;
  onEdit: () => void;
  multiline?: boolean;
}) {
  return (
    <div
      className={cn("flex gap-1", multiline ? "items-start" : "items-center")}
    >
      {children}
      {canEdit && (
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "h-6 w-6 shrink-0 opacity-50 hover:opacity-100",
            multiline && "mt-0.5",
          )}
          onClick={onEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
