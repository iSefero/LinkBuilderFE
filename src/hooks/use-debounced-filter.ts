"use client";

import { useEffect, useRef, useState } from "react";

export const FILTER_DEBOUNCE_MS = 400;

function defaultEquals<T>(a: T, b: T): boolean {
  return a === b;
}

/** Локальний draft + відкладене застосування до URL/фільтрів */
export function useDebouncedFilterField<T>(
  applied: T,
  onApply: (value: T) => void,
  equals: (a: T, b: T) => boolean = defaultEquals,
  delay = FILTER_DEBOUNCE_MS
) {
  const [draft, setDraft] = useState(applied);
  const onApplyRef = useRef(onApply);

  useEffect(() => {
    onApplyRef.current = onApply;
  }, [onApply]);

  useEffect(() => {
    setDraft(applied);
  }, [applied]);

  useEffect(() => {
    if (equals(draft, applied)) return;

    const timer = window.setTimeout(() => {
      onApplyRef.current(draft);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [draft, applied, equals, delay]);

  return [draft, setDraft] as const;
}

export function arrayEquals<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => item === b[i]);
}
