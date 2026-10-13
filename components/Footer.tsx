"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { company } from "@/lib/company";

const FOOTER_LINKS = [
  { href: "/terms", ko: "이용약관" },
  { href: "/privacy", ko: "개인정보처리방침" },
];

function isCurrent(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === href;
}

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-name" translate="no">
            {company.nameKo}
          </p>
          <p className="footer-address" translate="no">
            {company.address.ko}
          </p>
          <p className="footer-address" translate="no">
            {company.email}
          </p>
          {company.phone ? (
            <p className="footer-address" translate="no">
              {company.phone}
            </p>
          ) : null}
        </div>
      </div>
      <div className="wrap footer-links" aria-label="약관">
        {FOOTER_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
          >
            {item.ko}
          </Link>
        ))}
      </div>
      <div className="wrap footer-bottom">
        <p translate="no">
          © {new Date().getFullYear()} {company.nameKo}
        </p>
      </div>
    </footer>
  );
}
