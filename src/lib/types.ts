export enum Priority {
  MEDIUM = "medium",
  HIGH = "high",
}

export enum Breakdown {
  STANDARD = "standard",
  MAXIMIZED = "maximized",
  GENERATED = "generation",
}

export enum Status {
  WAITING = "waiting",
  IN_PROGRESS = "in_progress",
  READY_FOR_SERVER = "ready_for_server",
  UPLOAD = "upload",
  ERROR_WITH_SSL = "error_with_ssl",
  ERROR = "error",
  READY_FOR_PBN = "ready_for_pbn",
  DONE = "done",
}

export type PermissionAction = "read" | "create" | "update" | "delete";

export type ColumnKey =
  | "domain"
  | "wmd"
  | "priority"
  | "breakdown"
  | "links"
  | "responsible"
  | "server"
  | "status"
  | "errorMessage";

export type ColumnPermissions = Record<ColumnKey, PermissionAction[]>;

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  permissions: ColumnPermissions;
};

export type Server = {
  id: string;
  port: string;
};

export type Domain = {
  id: string;
  domain: string;
  wmd: boolean;
  priority: Priority;
  breakdown: Breakdown;
  version: string;
  links: string;
  responsible: string;
  server: string;
  status: Status;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDomainInput = {
  domain: string;
  priority: Priority;
  breakdown: Breakdown;
  version: string;
  links?: string;
  server?: string;
};

export type UpdateDomainInput = Partial<
  Omit<Domain, "id" | "createdAt" | "updatedAt">
>;
