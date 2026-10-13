"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { company } from "@/lib/company";

type NavChild = { href: string; ko: string };
type NavItem =
  | { href: string; ko: string; children?: undefined }
  | { ko: string; children: NavChild[] };

const NAV: NavItem[] = [
  {
    ko: "제품",
    children: [{ href: "/products/chaejeomi", ko: "채점이" }],
  },
  {
    ko: "서비스",
    children: [{ href: "/services/management-ai", ko: "경영관리 AI" }],
  },
  { href: "/resources", ko: "자료실" },
  { href: "/company", ko: "ABOUT" },
  { href: "/contact", ko: "문의" },
];

function isCurrent(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === href || path.startsWith(`${href}/`);
}

function isGroupCurrent(pathname: string, children: NavChild[]) {
  return children.some((child) => isCurrent(pathname, child.href));
}

function NavGroup({
  label,
  children,
  pathname,
}: {
  label: string;
  children: NavChild[];
  pathname: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ignoreHover, setIgnoreHover] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  function clearCloseTimer() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openMenu() {
    if (ignoreHover) return;
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setIgnoreHover(false);
      closeTimer.current = null;
    }, 80);
  }

  function closeMenuNow() {
    clearCloseTimer();
    setOpen(false);
    setIgnoreHover(true);
  }

  useEffect(() => {
    clearCloseTimer();
    setOpen(false);
    setIgnoreHover(true);
  }, [pathname]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        clearCloseTimer();
        setOpen(false);
        setIgnoreHover(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenuNow();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      clearCloseTimer();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`nav-group${isGroupCurrent(pathname, children) ? " is-active" : ""}${open ? " is-open" : ""}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="nav-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          if (open) {
            closeMenuNow();
            return;
          }
          setIgnoreHover(false);
          setOpen(true);
        }}
      >
        {label}
      </button>
      <div className="nav-dropdown" id={id} role="group" aria-label={label}>
        {children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            aria-current={isCurrent(pathname, child.href) ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              closeMenuNow();
              router.push(child.href);
            }}
          >
            {child.ko}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <>
      <a className="skip" href="#content">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link href="/" className="brand" aria-label={`${company.nameKo} 홈`} translate="no">
            {company.nameKo}
          </Link>
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map((item) =>
              item.children ? (
                <NavGroup key={item.ko} label={item.ko} pathname={pathname}>
                  {item.children}
                </NavGroup>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                >
                  {item.ko}
                </Link>
              ),
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
