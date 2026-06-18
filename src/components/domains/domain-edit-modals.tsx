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
import { LinksInputList } from "./links-input-list";

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
  links: string[];
  onSave: (links: string[]) => void;
};

export function LinksEditModal({
  open,
  onOpenChange,
  links,
  onSave,
}: LinksEditModalProps) {
  const [draft, setDraft] = useState(links);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(links.length ? links : [""]);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать ссылки</DialogTitle>
        </DialogHeader>
        <LinksInputList links={draft} onChange={setDraft} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              onSave(draft.filter(Boolean));
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
