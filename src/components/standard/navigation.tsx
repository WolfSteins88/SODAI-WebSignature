"use client";
import {navigationLinks} from "@/lib/content/visibility";
import {publicPaths} from "@/lib/content/public-routes";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { bookingLinks, type VillaContent } from "@/lib/schemas/content";
import { enabledModules } from "@/lib/content/public-routes";
import { Booking } from "../public/booking";
import { containDialogFocus } from "./dialog-focus";
export function Navigation({
  content,
  prefix,
}: {
  content: VillaContent;
  prefix: string;
}) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const modules = enabledModules(content);
  const links = navigationLinks(content,[
    ["Story", "/story"],
    ["Rooms", "/rooms"],
    ["Gallery", "/gallery"],
    ["Location", "/location"],
    ...(modules.dining ? [["Dining", "/dining"]] : []),
    ...(modules.experiences ? [["Experiences", "/experiences"]] : []),
    ...(modules.packages ? [["Packages", "/packages"]] : []),
  ]).filter(([,href])=>publicPaths(content).includes(href));
  function close() {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  }
  useEffect(() => {
    dialog.current?.close();
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);
  const navigation = (mobile = false) => (
    <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"}>
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={prefix + href}
          onClick={mobile ? close : undefined}
          aria-current={
            pathname === prefix + href ||
            pathname.startsWith(prefix + href + "/")
              ? "page"
              : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
  return (
    <>
      <a className="std-skip" href="#main">
        Skip to content
      </a>
      <header className="std-header">
        <Link
          className="std-brand"
          href={prefix + "/"}
          aria-label={`${content.name} home`}
        >
          {content.name}
          <span>{content.tagline}</span>
        </Link>
        <div className="std-desktop-nav">{navigation()}</div>
        {(bookingLinks(content).external || bookingLinks(content).whatsapp) && (
          <a className="std-reserve-link" href="#reservation">
            Plan your stay <span aria-hidden="true">↗</span>
          </a>
        )}
        <button
          ref={trigger}
          className="std-menu-toggle"
          aria-expanded={open}
          aria-controls="standard-menu"
          aria-haspopup="dialog"
          onClick={() => {
            dialog.current?.showModal();
            setOpen(true);
          }}
        >
          Menu <span aria-hidden="true">☰</span>
        </button>
      </header>
      <dialog
        ref={dialog}
        id="standard-menu"
        className="std-menu"
        aria-labelledby="standard-menu-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => setOpen(false)}
        onKeyDown={containDialogFocus}
      >
        <div className="std-menu-top">
          <h2 id="standard-menu-title">Explore {content.name}</h2>
          <button autoFocus onClick={close} aria-label="Close navigation menu">
            ✕
          </button>
        </div>
        {navigation(true)}
        <Booking content={content} />
        <Link href={prefix + "/"} onClick={close}>
          Home
        </Link>
      </dialog>
    </>
  );
}
