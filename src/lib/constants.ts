import { Breakdown, Priority, Status, type ColumnKey } from "./types";

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.MEDIUM]: "Средний",
  [Priority.HIGH]: "Высокий",
};

export const BREAKDOWN_LABELS: Record<Breakdown, string> = {
  [Breakdown.STANDARD]: "Стандарт",
  [Breakdown.MAXIMIZED]: "Максимальный",
  [Breakdown.GENERATED]: "Генерация",
};

export const STATUS_LABELS: Record<Status, string> = {
  [Status.WAITING]: "В ожидании",
  [Status.IN_PROGRESS]: "В работе",
  [Status.READY_FOR_SERVER]: "Готов к привязке",
  [Status.UPLOAD]: "Загрузить",
  [Status.ERROR_WITH_SSL]: "Ошибка с SSL",
  [Status.ERROR]: "Ошибка",
  [Status.READY_FOR_PBN]: "Готов к PBN",
  [Status.DONE]: "Завершён",
};

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  domain: "Домен",
  wmd: "WMD",
  priority: "Приоритет",
  breakdown: "Детализация",
  links: "Доп. ссылки",
  responsible: "Ответственный",
  server: "Сервер",
  status: "Статус",
  errorMessage: "Проблема",
};

export const COLUMN_AVAILABLE_PERMISSIONS: Record<
  ColumnKey,
  ("create" | "update" | "delete")[]
> = {
  domain: ["create", "update", "delete"],
  wmd: ["update"],
  priority: ["update"],
  breakdown: ["update"],
  links: ["create", "update", "delete"],
  responsible: ["update"],
  server: ["create", "update"],
  status: ["update"],
  errorMessage: ["create", "update", "delete"],
};

export const ALL_COLUMNS: ColumnKey[] = [
  "domain",
  "wmd",
  "priority",
  "breakdown",
  "links",
  "responsible",
  "server",
  "status",
  "errorMessage",
];
