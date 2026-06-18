"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type CopyLinkActionsProps = {
  value: string;
  href?: string;
  copyTitle?: string;
  openTitle?: string;
  className?: string;
};

export function CopyLinkActions({
  value,
  href,
  copyTitle,
  openTitle = "Перейти",
  className,
}: CopyLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!value) return null;

  return (
    <div className={cn("flex shrink-0 items-center gap-0.5", className)}>
      {copyTitle && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 opacity-60 hover:opacity-100"
                onClick={handleCopy}
              />
            }
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </TooltipTrigger>
          <TooltipContent>{copied ? "Скопировано" : copyTitle}</TooltipContent>
        </Tooltip>
      )}
      {href && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6 opacity-60 hover:opacity-100"
                onClick={() =>
                  window.open(href, "_blank", "noopener,noreferrer")
                }
              />
            }
          >
            <ExternalLink className="h-3 w-3" />
          </TooltipTrigger>
          <TooltipContent>{openTitle}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
