import { createFullPermissions } from "./permissions";
import {
  Breakdown,
  Priority,
  Status,
  type Domain,
  type Server,
  type User,
} from "./types";

export const MOCK_SERVERS: Server[] = [
  { id: "srv-1", port: "192.168.1.10:8080" },
  { id: "srv-2", port: "192.168.1.11:8080" },
  { id: "srv-3", port: "10.0.0.5:3000" },
];

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    firstName: "Алексей",
    lastName: "Иванов",
    fullName: "Иванов Алексей",
    email: "alexey@example.com",
    permissions: createFullPermissions(),
  },
  {
    id: "user-2",
    firstName: "Мария",
    lastName: "Петрова",
    fullName: "Петрова Мария",
    email: "maria@example.com",
    permissions: {
      domain: ["read", "create", "update"],
      wmd: ["read", "update"],
      priority: ["read", "update"],
      breakdown: ["read"],
      links: ["read", "create", "update"],
      responsible: ["read"],
      server: ["read"],
      status: ["read", "update"],
      errorMessage: ["read", "create", "update"],
    },
  },
  {
    id: "user-3",
    firstName: "Дмитрий",
    lastName: "Сидоров",
    fullName: "Сидоров Дмитрий",
    email: "dmitry@example.com",
    permissions: {
      domain: ["read"],
      wmd: ["read"],
      priority: ["read"],
      breakdown: ["read"],
      links: ["read"],
      responsible: ["read", "update"],
      server: ["read", "update"],
      status: ["read"],
      errorMessage: ["read"],
    },
  },
];

const now = new Date();
const daysAgo = (days: number, hours = 0) =>
  new Date(
    now.getTime() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000
  ).toISOString();

const RESPONSIBLES = [
  "Иванов Алексей",
  "Петрова Мария",
  "Сидоров Дмитрий",
];

const SERVERS = [
  "192.168.1.10:8080",
  "192.168.1.11:8080",
  "10.0.0.5:3000",
  "",
];

const DOMAIN_PREFIXES = [
  "shop",
  "store",
  "market",
  "deal",
  "promo",
  "landing",
  "blog",
  "news",
  "portal",
  "service",
  "cloud",
  "digital",
  "media",
  "trade",
  "brand",
  "hub",
  "zone",
  "link",
  "web",
  "site",
];

const DOMAIN_SUFFIXES = [
  "ru",
  "com",
  "net",
  "org",
  "io",
  "shop",
  "store",
  "online",
  "pro",
  "dev",
];

const VERSIONS = [
  "v1.0.0",
  "v1.2.4/production",
  "v2.0.0-rc1",
  "staging/latest",
  "release/2024-11/build",
  "нет нормальных снапшотов",
  "https://web.archive.org/web/20190717203336/https://maacltd.com/",
  "https://web.archive.org/web/20181120152931/https://mk2025summit.com/",
  "https://web.archive.org/web/20250905174249/https://meetingservices.org/",
  "https://web.archive.org/web/20241206050754/https://elalambretickets.com/",
  "build/deploy-42/final",
  "main@abc123def456",
];

const ERROR_MESSAGES = [
  "Сайт не отвечает, таймаут при подключении",
  "Ошибка SSL-сертификата: сертификат просрочен",
  "DNS не резолвится для домена",
  "HTTP 502 Bad Gateway на главной странице",
  "Редирект зацикливается более 5 раз",
];

const ALL_STATUSES = Object.values(Status);
const ALL_BREAKDOWNS = Object.values(Breakdown);
const ALL_PRIORITIES = Object.values(Priority);

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function generateMockDomains(count: number): Domain[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const prefix = pick(DOMAIN_PREFIXES, i * 3);
    const suffix = pick(DOMAIN_SUFFIXES, i * 7 + 2);
    const slug = `${prefix}-${n}`;
    const status = pick(ALL_STATUSES, i * 5);
    const hasError =
      status === Status.ERROR || status === Status.ERROR_WITH_SSL;
    const days = i % 90;
    const links =
      i % 4 === 0
        ? [`https://ref${n}.example.com/utm`]
        : i % 7 === 0
          ? [
              `https://link-a-${n}.com`,
              `https://link-b-${n}.com`,
              `https://link-c-${n}.com`,
            ]
          : [];

    return {
      id: `dom-${n}`,
      domain: `${slug}.${suffix}`,
      wmd: i % 3 === 0,
      priority: pick(ALL_PRIORITIES, i),
      breakdown: pick(ALL_BREAKDOWNS, i * 2),
      version: pick(VERSIONS, i * 4),
      links,
      responsible: pick(RESPONSIBLES, i),
      server: pick(SERVERS, i * 3),
      status,
      ...(hasError ? { errorMessage: pick(ERROR_MESSAGES, i) } : {}),
      createdAt: daysAgo(days, i % 24),
      updatedAt: daysAgo(Math.max(0, days - (i % 5)), (i + 3) % 24),
    };
  });
}

export const MOCK_DOMAINS: Domain[] = generateMockDomains(60);
