"use client";
import { useRef, useState, useId, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "motion/react";
/** useLayouts Smooth Dropdown, adapted from owner-supplied source; no icon/measurement dependencies required. */
export function SectionDropdown({
  groups,
  value,
  label,
  onChange,
}: {
  groups: { title: string; items: string[] }[];
  value: string;
  label: (s: string) => string;
  onChange: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const id = useId(),
    reduced = useReducedMotion(),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const trigger = useRef<HTMLButtonElement>(null),
    menu = useRef<HTMLDivElement>(null);
  const choices = groups.flatMap((g) => g.items);
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <LayoutGroup id={id}>
      <div
        ref={root}
        className="cms-section-dropdown"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <span>Jump to</span>
        <button
          ref={trigger}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls="cms-section-menu"
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              requestAnimationFrame(() =>
                menu.current
                  ?.querySelector<HTMLButtonElement>("[aria-current=page]")
                  ?.focus(),
              );
            }
            if (e.key === "Escape") close();
          }}
        >
          {label(value)} <span aria-hidden="true">⌄</span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -2 }
              }
              transition={{
                type: "spring",
                damping: 34,
                stiffness: 380,
                mass: 0.8,
              }}
              ref={menu}
              id="cms-section-menu"
              role="menu"
              aria-label="Choose page or collection"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  close();
                  return;
                }
                const buttons = Array.from(
                    menu.current?.querySelectorAll<HTMLButtonElement>(
                      "button",
                    ) || [],
                  ),
                  current = buttons.indexOf(
                    document.activeElement as HTMLButtonElement,
                  );
                const index =
                  e.key === "ArrowDown"
                    ? (current + 1) % choices.length
                    : e.key === "ArrowUp"
                      ? (current + choices.length - 1) % choices.length
                      : e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? choices.length - 1
                          : -1;
                if (index >= 0) {
                  e.preventDefault();
                  buttons[index]?.focus();
                }
              }}
            >
              {groups.map((g) => (
                <div role="group" aria-label={g.title} key={g.title}>
                  <strong>{g.title}</strong>
                  {g.items.map((k) => (
                    <motion.button
                      initial={reduced ? false : { opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: reduced ? 0 : 0.04 + choices.indexOf(k) * 0.008,
                        duration: reduced ? 0 : 0.15,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      onPointerEnter={() => setHovered(k)}
                      onPointerLeave={() => setHovered(null)}
                      onFocus={() => setHovered(k)}
                      onBlur={() => setHovered(null)}
                      type="button"
                      role="menuitem"
                      aria-current={value === k ? "page" : undefined}
                      key={k}
                      onClick={() => {
                        onChange(k);
                        close();
                      }}
                    >
                      {(hovered ? hovered === k : value === k) && (
                        <motion.span
                          className="cms-dropdown-highlight"
                          aria-hidden="true"
                          layoutId="active-item"
                          transition={
                            reduced
                              ? { duration: 0 }
                              : {
                                  type: "spring",
                                  damping: 30,
                                  stiffness: 520,
                                  mass: 0.8,
                                }
                          }
                        />
                      )}
                      <span>{label(k)}</span>
                    </motion.button>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
