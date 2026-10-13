import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/company";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
};

export default function NotFound() {
  return (
    <section className="wrap page-intro">
      <p className="kicker" translate="no">
        {company.nameKo}
      </p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p className="lede">주소를 다시 확인하거나 홈으로 이동해 주세요.</p>
      <div className="actions" style={{ justifyContent: "flex-start" }}>
        <Link className="btn btn-solid" href="/">
          홈으로 →
        </Link>
      </div>
    </section>
  );
}
