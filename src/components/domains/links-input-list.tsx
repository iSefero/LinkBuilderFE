"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LinksInputListProps = {
  links: string[];
  onChange: (links: string[]) => void;
  disabled?: boolean;
};

export function LinksInputList({
  links,
  onChange,
  disabled,
}: LinksInputListProps) {
  const updateLink = (index: number, value: string) => {
    const next = [...links];
    next[index] = value;
    onChange(next);
  };

  const addLink = () => onChange([...links, ""]);

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {links.length === 0 && (
        <p className="text-sm text-muted-foreground">Ссылки не добавлены</p>
      )}
      {links.map((link, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={link}
            onChange={(e) => updateLink(index, e.target.value)}
            placeholder="https://example.com"
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => removeLink(index)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addLink}
        disabled={disabled}
      >
        <Plus className="mr-1 h-4 w-4" />
        Добавить ссылку
      </Button>
    </div>
  );
}
