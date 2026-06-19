"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CopyLinkActions } from "./copy-link-actions";

export type CellActionsConfig = {
  /** Значение для копирования */
  value?: string;
  /** Ссылка для перехода (кнопка «открыть») */
  href?: string;
  copyTitle?: string;
  openTitle?: string;
  /** Редактирование через модальное окно */
  onEdit?: () => void;
  editTitle?: string;
};

type CellWithActionsProps = {
  children: React.ReactNode;
  actions?: CellActionsConfig;
  multiline?: boolean;
};

export function CellWithActions({
  children,
  actions,
  multiline,
}: CellWithActionsProps) {
  const showCopyOpen = Boolean(actions?.value);
  const showEdit = Boolean(actions?.onEdit);

  if (!showCopyOpen && !showEdit) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "flex w-full gap-1",
        multiline ? "items-start" : "items-center",
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-0.5",
          multiline && "mt-0.5",
        )}
      >
        {showCopyOpen && (
          <CopyLinkActions
            value={actions!.value!}
            href={actions!.href}
            copyTitle={actions!.copyTitle}
            openTitle={actions!.openTitle}
          />
        )}
        {showEdit && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={actions!.onEdit}
                />
              }
            >
              <Pencil className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent>
              {actions!.editTitle ?? "Редактировать"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
