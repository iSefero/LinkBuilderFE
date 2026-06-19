"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { normalizeLinksInput } from "@/lib/links-helpers";
import { LinksTextarea } from "./links-textarea";

type TextEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
};

export function TextEditModal({
  open,
  onOpenChange,
  title,
  value,
  onSave,
  multiline,
  placeholder,
}: TextEditModalProps) {
  const [draft, setDraft] = useState(value);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(value);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>{title}</Label>
          {multiline ? (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              rows={4}
            />
          ) : (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type LinksEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: string;
  onSave: (links: string) => void;
};

export function LinksEditModal({
  open,
  onOpenChange,
  links,
  onSave,
}: LinksEditModalProps) {
  const [draft, setDraft] = useState(links);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(links);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать ссылки</DialogTitle>
        </DialogHeader>
        <LinksTextarea value={draft} onChange={setDraft} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              onSave(normalizeLinksInput(draft));
              onOpenChange(false);
            }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ResolveErrorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
  onConfirm: () => void;
};

export function ResolveErrorDialog({
  open,
  onOpenChange,
  errorMessage,
  onConfirm,
}: ResolveErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ошибка решена?</AlertDialogTitle>
          <AlertDialogDescription>
            Текущая проблема: {errorMessage || "—"}. Вы решили эту проблему?
            При подтверждении статус будет изменён, а описание проблемы удалено.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Нет</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Да, решено</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type DeleteDomainDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domainName: string;
  onConfirm: () => void;
  isPending?: boolean;
};

export function DeleteDomainDialog({
  open,
  onOpenChange,
  domainName,
  onConfirm,
  isPending,
}: DeleteDomainDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить домен?</AlertDialogTitle>
          <AlertDialogDescription>
            Домен{" "}
            <span className="font-medium text-foreground">{domainName}</span>{" "}
            будет удалён без возможности восстановления.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Удаление…" : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type BulkDeleteDomainsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
  isPending?: boolean;
};

export function BulkDeleteDomainsDialog({
  open,
  onOpenChange,
  count,
  onConfirm,
  isPending,
}: BulkDeleteDomainsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить выбранные домены?</AlertDialogTitle>
          <AlertDialogDescription>
            Будет удалено доменов:{" "}
            <span className="font-medium text-foreground">{count}</span>. Это
            действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "Удаление…" : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
