"use client";

import { Textarea } from "@/components/ui/textarea";

type LinksTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function LinksTextarea({
  value,
  onChange,
  disabled,
}: LinksTextareaProps) {
  return (
    <div className="space-y-1">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/ | https://example.com/page"
        rows={4}
        disabled={disabled}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Разделяйте ссылки символом |
      </p>
    </div>
  );
}
