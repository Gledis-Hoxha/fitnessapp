import { useState, useEffect } from "react";

// Controlled time input that holds local edits and commits to the parent
// on change/blur, so refetches can't overwrite an in-progress edit.
export default function ReminderTimeInput({ value, onCommit }) {
  const [local, setLocal] = useState(value || "");

  useEffect(() => {
    setLocal(value || "");
  }, [value]);

  const commit = () => {
    if (local && local !== value) onCommit(local);
  };

  return (
    <input
      type="time"
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        if (e.target.value) onCommit(e.target.value);
      }}
      onBlur={commit}
      className="bg-secondary/60 border border-border rounded-lg px-1.5 py-1 text-xs text-foreground outline-none focus:border-primary/50 w-[88px]"
    />
  );
}