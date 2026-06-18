import { COLUMN_AVAILABLE_PERMISSIONS } from "./constants";
import type { ColumnKey, ColumnPermissions, PermissionAction, User } from "./types";

export function createDefaultPermissions(): ColumnPermissions {
  return {
    domain: ["read"],
    wmd: ["read"],
    priority: ["read"],
    breakdown: ["read"],
    links: ["read"],
    responsible: ["read"],
    server: ["read"],
    status: ["read"],
    errorMessage: ["read"],
  };
}

export function createFullPermissions(): ColumnPermissions {
  const permissions = createDefaultPermissions();
  for (const column of Object.keys(COLUMN_AVAILABLE_PERMISSIONS) as ColumnKey[]) {
    permissions[column] = [
      "read",
      ...COLUMN_AVAILABLE_PERMISSIONS[column],
    ];
  }
  return permissions;
}

export function hasPermission(
  user: User | null,
  column: ColumnKey,
  action: PermissionAction
): boolean {
  if (!user) return false;
  return user.permissions[column]?.includes(action) ?? false;
}

export function canReadColumn(user: User | null, column: ColumnKey): boolean {
  return hasPermission(user, column, "read");
}
