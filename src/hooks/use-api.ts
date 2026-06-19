"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDomain,
  createServer,
  deleteDomains,
  getDomains,
  getServers,
  getUsers,
  updateDomain,
  updateUser,
} from "@/lib/mock-store";
import type { CreateDomainInput, UpdateDomainInput } from "@/lib/types";

export const domainKeys = {
  all: ["domains"] as const,
};

export const userKeys = {
  all: ["users"] as const,
};

export const serverKeys = {
  all: ["servers"] as const,
};

export function useDomains() {
  return useQuery({
    queryKey: domainKeys.all,
    queryFn: getDomains,
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDomainInput) => createDomain(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
    },
  });
}

export function useUpdateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDomainInput }) =>
      updateDomain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string | string[]) =>
      deleteDomains(Array.isArray(ids) ? ids : [ids]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: getUsers,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateUser>[1];
    }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useServers() {
  return useQuery({
    queryKey: serverKeys.all,
    queryFn: getServers,
  });
}

export function useCreateServer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (port: string) => createServer(port),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serverKeys.all });
    },
  });
}
