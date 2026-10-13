"use client";
import { bookingLinks } from "@/lib/schemas/content";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import type { VillaContent } from "@/lib/schemas/content";
import { Booking } from "./booking";
export function Header({
  content,
  variant,
  prefix = "",
}: {
  content: VillaContent;
  variant: string;
  prefix?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const signature = variant === "signature";
  const nav = [
    ["Our story", signature ? "/" : "/story"],
    ["The villas", "/rooms"],
    ...(content.modules.dining ? [["Dining", "/dining"]] : []),
    ...(content.modules.experiences ? [["Experiences", "/experiences"]] : []),
    ["Gallery", "/gallery"],
    ["Find us", "/location"],
  ];
  useEffect(() => {
    dialog.current?.close();
    document.body.style.overflow = "";
  }, [path]);
  useEffect(
    () => () => {
      document.body.style.overflow = "";
    },
    [],
  );
  function close() {
    dialog.current?.close();
    document.body.style.overflow = "";
    button.current?.focus();
  }
  function open() {
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      gsap.fromTo(
        dialog.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
      );
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={signature ? "signature-rail" : "standard-header"}>
        <Link
          href={prefix + "/"}
          className="wordmark"
          aria-label={`${content.name} home`}
        >
          <span className="brand-flower" aria-hidden="true">
            ✳
          </span>
          <span>
            {content.name}
            <small>BALI · PRIVATE VILLAS</small>
          </span>
        </Link>
        {!signature ? (
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={prefix + href}
                aria-current={path === prefix + href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
        ) : null}
        <button
          className="menu-toggle"
          ref={button}
          onClick={open}
          aria-label="Open navigation menu"
        >
          <span></span>
          <span></span>
          <span className="menu-word">Menu</span>
        </button>
        {signature ? (
          <span className="rail-caption">A slower kind of stay</span>
        ) : null}
        {!signature ? <Booking content={content} compact /> : null}
      </header>
      {signature && bookingLinks(content).whatsapp ? (
        <div className="signature-reserve">
          <Booking content={content} compact />
        </div>
      ) : null}
      <dialog
        ref={dialog}
        className={`navigation-dialog ${signature ? "red-menu" : ""}`}
        onCancel={close}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="menu-visual">
          <Image
            src={content.hero.src}
            alt={content.hero.alt}
            fill
            sizes="40vw"
            unoptimized={content.hero.src.startsWith("/api/media/")}
          />
          <span>
            A place to come
            <br />
            back to yourself.
          </span>
        </div>
        <div className="menu-content">
          <div className="menu-top">
            <Link href={prefix + "/"} className="wordmark">
              {content.name}
            </Link>
            <button
              className="icon-button"
              aria-label="Close navigation menu"
              onClick={close}
            >
              ✕
            </button>
          </div>
          <nav aria-label="Expanded navigation">
            {nav.map(([label, href], i) => (
              <div key={href}>
                <Link onClick={close} href={prefix + href}>
                  <small>0{i + 1}</small>
                  {label}
                  <span>↗</span>
                </Link>
                {href === "/rooms" ? (
                  <div className="menu-rooms">
                    {content.rooms.map((r) => (
                      <Link
                        key={r.slug}
                        onClick={close}
                        href={prefix + "/rooms/" + r.slug}
                      >
                        {r.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
          <div className="menu-bottom">
            <div>
              <span className="eyebrow">Get in touch</span>
              <a href={`mailto:${content.email}`}>{content.email}</a>
            </div>
            {content.modules.packages ? (
              <Link onClick={close} href={prefix + "/packages"}>
                Offers & stays ↗
              </Link>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
