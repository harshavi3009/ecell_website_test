"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

// React Bits' PillNav (https://reactbits.dev), adapted for this project:
// - react-router-dom's <Link> swapped for next/link. The active pill is
//   detected from the current route automatically instead of a hardcoded
//   `activeHref` prop.
// - Added support for a dropdown entry (used for "Events", which needs to
//   list every event per PAGES.md) — the original component only supported
//   a flat row of links.
// - Switched from the original's floating/absolute position to a normal
//   in-flow header, so it doesn't overlap page content underneath it (the
//   original is meant to float over a hero image).
// - Added an optional `trailingContent` slot (used for the theme toggle) that
//   renders next to the pills/hamburger, grouped with them so the outer
//   logo/rest layout is unaffected.
// TODO(owner): colours below are a temporary black/white placeholder until
// real brand colours are chosen (see CLAUDE.md).

export type PillNavLink = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export type PillNavDropdown = {
  label: string;
  ariaLabel?: string;
  children: PillNavLink[];
};

export type PillNavEntry = PillNavLink | PillNavDropdown;

function isDropdown(entry: PillNavEntry): entry is PillNavDropdown {
  return "children" in entry;
}

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  logoHref?: string;
  logoText?: string;
  items: PillNavEntry[];
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
  trailingContent?: React.ReactNode;
}

export default function PillNav({
  logo,
  logoAlt = "Logo",
  logoHref = "/",
  logoText,
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#000000",
  pillColor = "#ffffff",
  hoveredPillTextColor = "#ffffff",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  trailingContent,
}: PillNavProps) {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<number | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<number | null>(null);

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoLinkRef = useRef<HTMLAnchorElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    if (mobileMenuRef.current) {
      gsap.set(mobileMenuRef.current, { visibility: "hidden", opacity: 0, y: 0 });
    }

    if (initialLoadAnimation) {
      if (logoLinkRef.current) {
        gsap.set(logoLinkRef.current, { scale: 0 });
        gsap.to(logoLinkRef.current, { scale: 1, duration: 0.6, ease });
      }
      if (navItemsRef.current) {
        gsap.set(navItemsRef.current, { width: 0, overflow: "hidden" });
        gsap.to(navItemsRef.current, { width: "auto", duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation]);

  // Close the desktop dropdown when tapping/clicking outside it.
  useEffect(() => {
    if (openDesktopDropdown === null) return;
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpenDesktopDropdown(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openDesktopDropdown]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, { rotate: 360, duration: 0.4, ease, overwrite: "auto" });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    if (!newState) setOpenMobileDropdown(null);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll(".hamburger-line");
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: "visible" });
        gsap.fromTo(menu, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease,
          onComplete: () => gsap.set(menu, { visibility: "hidden" }),
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
    ["--nav-h"]: "42px",
    ["--pill-pad-x"]: "18px",
    ["--pill-gap"]: "3px",
  } as React.CSSProperties;

  const basePillClasses =
    "relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[16px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-0";

  return (
    <div ref={wrapperRef} className="relative w-full z-[1000] py-3 px-4" style={cssVars}>
      <nav className={`w-full flex items-center justify-between ${className}`} aria-label="Primary">
        <Link
          href={logoHref}
          ref={logoLinkRef}
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          className="flex items-center gap-2 shrink-0 no-underline"
        >
          <span
            className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden shrink-0"
            style={{ width: "var(--nav-h)", height: "var(--nav-h)", background: "var(--base, #000)" }}
          >
            {/* Plain <img>, not next/image: size is driven by the --nav-h
                CSS variable and GSAP rotates it on hover, both of which are
                simpler with a plain element here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={logoAlt} ref={logoImgRef} className="w-full h-full object-cover block" />
          </span>
          {logoText && (
            <span className="text-base font-semibold leading-none whitespace-nowrap text-white">
              {logoText}
            </span>
          )}
        </Link>

        {/* Pills/hamburger + theme toggle, grouped so the outer logo/rest
            layout above is unaffected by adding the toggle. */}
        <div className="flex items-center gap-2">
        {/* Desktop pills */}
        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden md:flex"
          style={{ height: "var(--nav-h)", background: "var(--base, #000)" }}
        >
          <ul role="menubar" className="list-none flex items-stretch m-0 p-[3px] h-full" style={{ gap: "var(--pill-gap)" }}>
            {items.map((item, i) => {
              const pillStyle: React.CSSProperties = {
                background: "var(--pill-bg, #fff)",
                color: "var(--pill-text, var(--base, #000))",
                paddingLeft: "var(--pill-pad-x)",
                paddingRight: "var(--pill-pad-x)",
              };

              const PillInner = (
                <>
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                    style={{ background: "var(--base, #000)", willChange: "transform" }}
                    aria-hidden="true"
                    ref={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-[1] z-[2]">
                    <span className="pill-label relative z-[2] inline-block leading-[1]" style={{ willChange: "transform" }}>
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                      style={{ color: "var(--hover-text, #fff)", willChange: "transform, opacity" }}
                      aria-hidden="true"
                    >
                      {item.label}
                    </span>
                  </span>
                </>
              );

              if (isDropdown(item)) {
                const isOpen = openDesktopDropdown === i;
                const isActive = item.children.some((child) => child.href === pathname);
                return (
                  <li key={item.label} role="none" className="relative flex h-full">
                    <button
                      type="button"
                      role="menuitem"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      aria-label={item.ariaLabel || item.label}
                      className={basePillClasses}
                      style={pillStyle}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                      onClick={() => setOpenDesktopDropdown(isOpen ? null : i)}
                    >
                      {PillInner}
                      {isActive && (
                        <span
                          className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                          style={{ background: "var(--base, #000)" }}
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div
                        className="absolute left-0 top-full mt-2 min-w-[180px] rounded-2xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                        style={{ background: "var(--pill-bg, #fff)" }}
                        role="menu"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            className="block rounded-xl px-4 py-2 text-[15px] font-medium hover:opacity-70"
                            style={{ color: "var(--pill-text, #000)" }}
                            onClick={() => setOpenDesktopDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              }

              const isActive = pathname === item.href;
              return (
                <li key={item.href} role="none" className="flex h-full">
                  <Link
                    role="menuitem"
                    href={item.href}
                    className={basePillClasses}
                    style={pillStyle}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {PillInner}
                    {isActive && (
                      <span
                        className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                        style={{ background: "var(--base, #000)" }}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          type="button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="pill-mobile-menu"
          className="md:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative"
          style={{ width: "var(--nav-h)", height: "var(--nav-h)", background: "var(--base, #000)" }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-transform duration-300"
            style={{ background: "var(--pill-bg, #fff)" }}
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-transform duration-300"
            style={{ background: "var(--pill-bg, #fff)" }}
          />
        </button>

        {trailingContent}
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="pill-mobile-menu"
        ref={mobileMenuRef}
        className="md:hidden absolute top-full left-4 right-4 rounded-[27px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[998] origin-top"
        style={{ background: "var(--base, #000)" }}
      >
        <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
          {items.map((item, i) => {
            const linkClasses =
              "flex min-h-11 items-center py-3 px-4 text-[16px] font-medium rounded-[50px] transition-colors duration-200";
            const linkStyle: React.CSSProperties = { background: "var(--pill-bg, #fff)", color: "var(--pill-text, #000)" };

            if (isDropdown(item)) {
              const isOpen = openMobileDropdown === i;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenMobileDropdown(isOpen ? null : i)}
                    className={`${linkClasses} w-full justify-between`}
                    style={linkStyle}
                  >
                    {item.label}
                    <span aria-hidden>{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <ul className="flex flex-col gap-[3px] mt-[3px] pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={linkClasses}
                            style={linkStyle}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setOpenMobileDropdown(null);
                            }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link href={item.href} className={linkClasses} style={linkStyle} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
