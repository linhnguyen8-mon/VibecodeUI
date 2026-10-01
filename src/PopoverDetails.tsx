import { useState, type ComponentProps } from "react";
import { useOutsideDismiss } from "./hooks/useOutsideDismiss";

export function PopoverDetails({ onToggle, ...props }: ComponentProps<"details">) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideDismiss<HTMLDetailsElement>(open, () => {
    if (ref.current) ref.current.open = false;
    setOpen(false);
  });
  return <details {...props} ref={ref} onToggle={event => {
    setOpen(event.currentTarget.open);
    onToggle?.(event);
  }} />;
}
