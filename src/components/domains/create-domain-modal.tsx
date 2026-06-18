"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Breakdown, Priority } from "@/lib/types";
import { useCreateDomain, useDomains, useServers } from "@/hooks/use-api";
import { LinksInputList } from "./links-input-list";
import { BreakdownSelect, PrioritySelect } from "./colored-selects";

const schema = z.object({
  domain: z.string().min(1, "Обязательное поле"),
  priority: z.nativeEnum(Priority),
  breakdown: z.nativeEnum(Breakdown),
  version: z.string().min(1, "Обязательное поле"),
  server: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type CreateDomainModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDomainModal({
  open,
  onOpenChange,
}: CreateDomainModalProps) {
  const createDomain = useCreateDomain();
  const { data: domains = [] } = useDomains();
  const { data: servers = [] } = useServers();
  const [links, setLinks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      domain: "",
      priority: Priority.MEDIUM,
      breakdown: Breakdown.STANDARD,
      version: "",
      server: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    const duplicate = domains.some(
      (d) => d.domain.toLowerCase() === data.domain.toLowerCase(),
    );
    if (duplicate) {
      setError("Домен уже существует");
      return;
    }
    try {
      await createDomain.mutateAsync({
        domain: data.domain,
        priority: data.priority,
        breakdown: data.breakdown,
        version: data.version,
        links: links.filter(Boolean),
        server: data.server || undefined,
      });
      reset();
      setLinks([]);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      setLinks([]);
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать домен</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="domain">Домен *</Label>
            <Input
              id="domain"
              placeholder="example.com"
              {...register("domain")}
            />
            {errors.domain && (
              <p className="text-xs text-destructive">
                {errors.domain.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Приоритет *</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <PrioritySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  className="h-8 w-full border border-input bg-background px-2.5 shadow-none"
                />
              )}
            />
          </div>

          <div className="space-y-1">
            <Label>Детализация *</Label>
            <Controller
              name="breakdown"
              control={control}
              render={({ field }) => (
                <BreakdownSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  className="h-8 w-full border border-input bg-background px-2.5 shadow-none"
                />
              )}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="version">Версия *</Label>
            <Input
              id="version"
              placeholder="https://web.archive.org/web/..."
              {...register("version")}
            />
            {errors.version && (
              <p className="text-xs text-destructive">
                {errors.version.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Доп. ссылки</Label>
            <LinksInputList links={links} onChange={setLinks} />
          </div>

          <div className="space-y-1">
            <Label>Сервер</Label>
            <Controller
              name="server"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? field.value : "__empty"}
                  onValueChange={(v) =>
                    field.onChange(v === "__empty" ? "" : (v ?? ""))
                  }
                >
                  <SelectTrigger className="w-full">
                    <span className="text-sm">
                      {field.value || "Не выбран"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__empty">Не выбран</SelectItem>
                    {servers.map((s) => (
                      <SelectItem key={s.id} value={s.port}>
                        {s.port}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createDomain.isPending}>
              {createDomain.isPending ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
