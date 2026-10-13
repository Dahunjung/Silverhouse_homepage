import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "경영관리 AI",
  description: `${company.nameKo} 경영관리 AI 서비스 안내 페이지입니다. 곧 자세한 내용을 공개합니다.`,
};

export default function ManagementAiPage() {
  return (
    <article className="wrap page-article">
      <header className="page-intro">
        <p className="kicker">서비스</p>
        <h1>경영관리 AI</h1>
        <p className="lede">
          경영관리 AI 서비스 안내를 준비하고 있습니다. 자세한 내용은 곧 이 페이지에 공개할 예정입니다.
        </p>
      </header>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <a className="btn btn-solid" href={`mailto:${company.email}?subject=경영관리 AI 문의`}>
          사전 문의 →
        </a>
        <Link className="btn btn-outline" href="/">
          홈으로
        </Link>
      </div>
    </article>
  );
}
