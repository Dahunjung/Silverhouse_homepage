import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "자료실",
  description: `${company.nameKo} 자료실입니다. 곧 자료를 공개할 예정입니다.`,
};

export default function ResourcesPage() {
  return (
    <article className="wrap page-article">
      <header className="page-intro">
        <p className="kicker">{company.nameKo}</p>
        <h1>자료실</h1>
        <p className="lede">
          자료실을 준비하고 있습니다. 다운로드와 안내 자료는 곧 이 페이지에 공개할 예정입니다.
        </p>
      </header>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <a className="btn btn-solid" href={`mailto:${company.email}?subject=자료실 문의`}>
          문의하기 →
        </a>
        <Link className="btn btn-outline" href="/">
          홈으로
        </Link>
      </div>
    </article>
  );
}
