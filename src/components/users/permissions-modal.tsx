"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ALL_COLUMNS,
  COLUMN_AVAILABLE_PERMISSIONS,
  COLUMN_LABELS,
} from "@/lib/constants";
import { createDefaultPermissions } from "@/lib/permissions";
import type { ColumnKey, ColumnPermissions, User } from "@/lib/types";
import { useUpdateUser } from "@/hooks/use-api";
import { useAuth } from "@/providers/auth-provider";

type PermissionsModalProps = {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PermissionsModal({
  user,
  open,
  onOpenChange,
}: PermissionsModalProps) {
  const updateUser = useUpdateUser();
  const { user: currentUser, refreshUser } = useAuth();
  const [permissions, setPermissions] = useState<ColumnPermissions>(
    createDefaultPermissions()
  );

  const handleOpenChange = (next: boolean) => {
    if (next && user) {
      setPermissions(structuredClone(user.permissions));
    }
    onOpenChange(next);
  };

  const togglePermission = (
    column: ColumnKey,
    action: "create" | "update" | "delete"
  ) => {
    setPermissions((prev) => {
      const current = new Set(prev[column]);
      if (current.has(action)) {
        current.delete(action);
      } else {
        current.add(action);
      }
      return { ...prev, [column]: ["read", ...Array.from(current).filter((a) => a !== "read")] };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    await updateUser.mutateAsync({ id: user.id, data: { permissions } });
    if (currentUser?.id === user.id) {
      await refreshUser();
    }
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Права доступа — {user.fullName || user.email}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {ALL_COLUMNS.map((column) => (
            <div key={column}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {COLUMN_LABELS[column]}
                </span>
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between opacity-60">
                  <Label className="text-sm">Чтение</Label>
                  <Switch checked disabled />
                </div>
                {COLUMN_AVAILABLE_PERMISSIONS[column].map((action) => {
                  const labels = {
                    create: "Создание",
                    update: "Редактирование",
                    delete: "Удаление",
                  };
                  return (
                    <div
                      key={action}
                      className="flex items-center justify-between"
                    >
                      <Label className="text-sm">{labels[action]}</Label>
                      <Switch
                        checked={permissions[column].includes(action)}
                        onCheckedChange={() =>
                          togglePermission(column, action)
                        }
                      />
                    </div>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={updateUser.isPending}>
            {updateUser.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
