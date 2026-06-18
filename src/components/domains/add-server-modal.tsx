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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateServer } from "@/hooks/use-api";

type AddServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (port: string) => void;
};

export function AddServerModal({
  open,
  onOpenChange,
  onCreated,
}: AddServerModalProps) {
  const [port, setPort] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createServer = useCreateServer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!port.trim()) {
      setError("Введите адрес сервера");
      return;
    }
    try {
      const server = await createServer.mutateAsync(port.trim());
      onCreated?.(server.port);
      setPort("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPort("");
          setError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Добавить сервер</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="server-port">Адрес сервера</Label>
            <Input
              id="server-port"
              placeholder="192.168.1.1:8080"
              value={port}
              onChange={(e) => setPort(e.target.value)}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={createServer.isPending}>
              {createServer.isPending ? "Сохранение..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
