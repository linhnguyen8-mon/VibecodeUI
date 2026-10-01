import { useEffect, useRef } from "react";

export function useOutsideDismiss<T extends HTMLElement>(active: boolean, dismiss: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active) return;
    const outside = (event: PointerEvent) => {
      if (ref.current && !event.composedPath().includes(ref.current)) dismiss();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
    };
  }, [active, dismiss]);
  return ref;
}
