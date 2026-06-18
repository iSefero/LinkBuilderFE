import { MOCK_DOMAINS, MOCK_SERVERS, MOCK_USERS } from "./mock-data";
import type { CreateDomainInput, Domain, Server, UpdateDomainInput, User } from "./types";

type Store = {
  domains: Domain[];
  users: User[];
  servers: Server[];
  currentUserId: string | null;
};

const store: Store = {
  domains: structuredClone(MOCK_DOMAINS),
  users: structuredClone(MOCK_USERS),
  servers: structuredClone(MOCK_SERVERS),
  currentUserId: null,
};

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDomains(): Promise<Domain[]> {
  await delay();
  return structuredClone(store.domains);
}

export async function createDomain(input: CreateDomainInput): Promise<Domain> {
  await delay();
  const exists = store.domains.some(
    (d) => d.domain.toLowerCase() === input.domain.toLowerCase()
  );
  if (exists) {
    throw new Error("Домен уже существует");
  }
  const now = new Date().toISOString();
  const domain: Domain = {
    id: `dom-${Date.now()}`,
    domain: input.domain,
    wmd: false,
    priority: input.priority,
    breakdown: input.breakdown,
    version: input.version,
    links: input.links ?? [],
    responsible: "",
    server: input.server ?? "",
    status: "waiting" as Domain["status"],
    createdAt: now,
    updatedAt: now,
  };
  store.domains.unshift(domain);
  return structuredClone(domain);
}

export async function updateDomain(
  id: string,
  input: UpdateDomainInput
): Promise<Domain> {
  await delay();
  const index = store.domains.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Домен не найден");

  if (input.domain) {
    const exists = store.domains.some(
      (d) =>
        d.id !== id && d.domain.toLowerCase() === input.domain!.toLowerCase()
    );
    if (exists) throw new Error("Домен уже существует");
  }

  store.domains[index] = {
    ...store.domains[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  return structuredClone(store.domains[index]);
}

export async function getUsers(): Promise<User[]> {
  await delay();
  return structuredClone(store.users);
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "firstName" | "lastName" | "permissions">>
): Promise<User> {
  await delay();
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("Пользователь не найден");

  const user = store.users[index];
  const firstName = data.firstName ?? user.firstName;
  const lastName = data.lastName ?? user.lastName;

  store.users[index] = {
    ...user,
    ...data,
    firstName,
    lastName,
    fullName: `${lastName} ${firstName}`,
  };
  return structuredClone(store.users[index]);
}

export async function getServers(): Promise<Server[]> {
  await delay();
  return structuredClone(store.servers);
}

export async function createServer(port: string): Promise<Server> {
  await delay();
  const exists = store.servers.some((s) => s.port === port);
  if (exists) throw new Error("Сервер уже существует");
  const server: Server = { id: `srv-${Date.now()}`, port };
  store.servers.push(server);
  return structuredClone(server);
}

export async function signInWithGoogle(email: string): Promise<User> {
  await delay(400);
  let user = store.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      firstName: "",
      lastName: "",
      fullName: "",
      email,
      permissions: structuredClone(
        store.users.find((u) => u.id === "user-3")!.permissions
      ),
    };
    store.users.push(user);
  }
  store.currentUserId = user.id;
  return structuredClone(user);
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(100);
  if (!store.currentUserId) return null;
  const user = store.users.find((u) => u.id === store.currentUserId);
  return user ? structuredClone(user) : null;
}

export async function signOut(): Promise<void> {
  await delay(100);
  store.currentUserId = null;
}

export const GOOGLE_ACCOUNTS = [
  { email: "alexey@example.com", label: "alexey@example.com (Админ)" },
  { email: "maria@example.com", label: "maria@example.com" },
  { email: "dmitry@example.com", label: "dmitry@example.com" },
];
